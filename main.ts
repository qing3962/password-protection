import { App, normalizePath, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, setIcon, WorkspaceLeaf, FileView, moment } from 'obsidian';
import { I18n } from "./i18n";
import type { LangType, LangTypeAndAuto, TransItemType } from "./i18n";

const ADD_PATH_MAX = 6;
const PASSWORD_LENGTH_MIN = 1;
const PASSWORD_LENGTH_MAX = 20;
const ENCRYPT_KEY = 30;
const ROOT_PATH = normalizePath("/");
const SOLID_PASS = 'qBjSbeiu2qDNEq5d';

interface PasswordPluginSettings {
    protectedPath: string;
    addedProtectedPath: string[];
    protectEnabled: boolean;
    password: string;
    lang: LangTypeAndAuto;
    forbidClosePassVerifyModal: boolean;
    autoLockInterval: number;
    pwdHintQuestion: string;
    isLastVerifyPasswordCorrect: boolean;
    timeOnUnload: moment.Moment | number;
}

const DEFAULT_SETTINGS: PasswordPluginSettings = {
    protectedPath: ROOT_PATH,
    addedProtectedPath: [],
    protectEnabled: false,
    password: '',
    lang: "auto",
    forbidClosePassVerifyModal: false,
    autoLockInterval: 0,
    pwdHintQuestion: '',
    isLastVerifyPasswordCorrect: false,
    timeOnUnload: 0
}

export default class PasswordPlugin extends Plugin {
    settings: PasswordPluginSettings;
    isVerifyPasswordWaitting: boolean = false;
    isVerifyPasswordCorrect: boolean = false;
    lastUnlockOrOpenFileTime: moment.Moment | null = null;
    startupFile: TFile[] = [];
    isLayoutReady: boolean = true;

    passwordRibbonBtn: HTMLElement;
    i18n: I18n;

    t = (x: TransItemType, vars?: any) => {
        return this.i18n.t(x, vars);
    };

    async onload() {
        await this.loadSettings();

        this.lastUnlockOrOpenFileTime = moment();

        // check if the protected path is empty, if so, set to root path
        //console.log(`onload, protectedPath: ${this.settings.protectedPath}`);
        this.settings.protectedPath = this.settings.protectedPath.trim();
        if (this.settings.protectedPath.length == 0 || this.settings.protectedPath[0] != '/') {
            this.settings.protectedPath = ROOT_PATH + this.settings.protectedPath;
        }

        // check if the added protected path array exceed the limit, if so, remove the extra
        if (this.settings.addedProtectedPath.length > ADD_PATH_MAX) {
            this.settings.addedProtectedPath.slice(ADD_PATH_MAX, this.settings.addedProtectedPath.length - ADD_PATH_MAX);
        }

        // check if the added protected path is empty, if so, remove it
        this.settings.addedProtectedPath = this.settings.addedProtectedPath.filter(str => str.trim() !== '');

        // lang should be load early, but after settings
        this.i18n = new I18n(this.settings.lang, async (lang: LangTypeAndAuto) => {
            this.settings.lang = lang;
            await this.saveSettings();
        });

        // This creates an icon in the left ribbon.
        if (this.settings.protectEnabled) {
            this.passwordRibbonBtn = this.addRibbonIcon('unlock', this.t("close_password_protection"), (evt: MouseEvent) => {
                this.switchPasswordProtection();
            });
        } else {
            this.passwordRibbonBtn = this.addRibbonIcon('lock', this.t("open_password_protection"), (evt: MouseEvent) => {
                this.switchPasswordProtection();
            });
        }

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'Open password protection',
            name: this.t("open"),
            callback: () => {
                this.openPasswordProtection();
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new PasswordSettingTab(this.app, this));

        // when the layout is ready, check if the root folder need to be protected, if so, close all notes, show the password dialog
        this.app.workspace.onLayoutReady(() => {
            if (this.settings.protectEnabled && this.isIncludeRootPath()) {
                if (!this.isVerifyPasswordCorrect) {
                    this.closeLeaves();

                    let curTime = moment();
                    if (curTime.diff(this.settings.timeOnUnload, 'second') <= 2 && this.settings.isLastVerifyPasswordCorrect) {
                        this.isVerifyPasswordCorrect = true;
                    } else {
                        this.verifyToClosePasswordProtection();
                    }
                }
            }
        });

        // when the file opened, check if it need to be protected, if so, close it, and show the password dialog
        this.registerEvent(this.app.workspace.on('file-open', (file: TFile | null) => {
            if (file != null) {
                this.autoLockCheck();
                if (this.settings.protectEnabled && !this.isVerifyPasswordCorrect && this.isProtectedFile(file)) {
                    // firstly cache the file if startuping, close the file, then show the password dialog
                    if (this.isLayoutReady && this.isVerifyPasswordWaitting) {
                        this.startupFile.push(file);
                    }
                    this.closeLeave(file);
                    this.closePasswordProtection(file);
                }
                // update the time of last open file, the file may be protected and may be not.
                if (this.settings.protectEnabled && this.isVerifyPasswordCorrect) {
                    this.lastUnlockOrOpenFileTime = moment();
                }
            }
        }));

        // when the search view opened, check if it need to be protected, if so, show the password dialog.
        this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
            if (leaf != null && leaf.view != null) {
                let viewType = leaf.view.getViewType();
                if (viewType == 'search') {
                    this.autoLockCheck();
                    if (this.settings.protectEnabled && !this.isVerifyPasswordCorrect) {
                        // show the password dialog
                        this.verifyToClosePasswordProtection();
                    }
                    // update the time of last search view actived.
                    if (this.settings.protectEnabled && this.isVerifyPasswordCorrect) {
                        this.lastUnlockOrOpenFileTime = moment();
                    }
                }
            }
        }));

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        if (this.settings.protectEnabled && this.settings.autoLockInterval > 0) {
            this.registerInterval(window.setInterval(() => this.autoLockCheck(), 10 * 1000));
        }
    }

    async onunload() {
        this.settings.isLastVerifyPasswordCorrect = this.isVerifyPasswordCorrect;
        this.settings.timeOnUnload = moment();
        await this.saveSettings();
    }

    autoLockCheck() {
        if (this.settings.protectEnabled && this.isVerifyPasswordCorrect && this.settings.autoLockInterval > 0) {
            let curTime = moment();
            if (curTime.diff(this.lastUnlockOrOpenFileTime, 'minute') >= this.settings.autoLockInterval) {
                this.isVerifyPasswordCorrect = false;
            }
        }
    }

    // open note
    async openLeave(file: TFile) {
        let leaf = this.app.workspace.getLeaf(false);
        if (leaf != null) {
            leaf.openFile(file);
        }
    }

    // close a note
    async closeLeave(file: TFile) {
        let leaves: WorkspaceLeaf[] = [];

        this.app.workspace.iterateAllLeaves((leaf) => {
            leaves.push(leaf);
        });

        const emptyLeaf = async (leaf: WorkspaceLeaf): Promise<void> => {
            leaf.setViewState({ type: 'empty' });
        }

        for (const leaf of leaves) {
            if (leaf != null && leaf.view instanceof FileView) {
                if (leaf.view.file != null) {
                    if (leaf.view.file.path == file.path) {
                        await emptyLeaf(leaf);
                        leaf.detach();
                        break;
                    }
                }
            }
        }
    }

    // close notes
    async closeLeaves() {
        let leaves: WorkspaceLeaf[] = [];

        this.app.workspace.iterateAllLeaves((leaf) => {
            leaves.push(leaf);
        });

        const emptyLeaf = async (leaf: WorkspaceLeaf): Promise<void> => {
            leaf.setViewState({ type: 'empty' });
        }

        for (const leaf of leaves) {
            if (leaf.view instanceof FileView && leaf.view.file != null) {
                let needClose = this.isProtectedFile(leaf.view.file);
                if (needClose) {
                    await emptyLeaf(leaf);
                    leaf.detach();
                }
            }
        }
    }

    // open or close password protection
    switchPasswordProtection() {
        if (this.settings.protectEnabled) {
            if (!this.isVerifyPasswordCorrect) {
                this.verifyToClosePasswordProtection();
            } else {
                this.openPasswordProtection();
            }
        } else {
            this.openPasswordProtection();
        }
    }

    // open password protection
    openPasswordProtection() {
        if (!this.settings.protectEnabled) {
            new Notice(this.t("notice_set_password"));
        } else {
            if (this.isVerifyPasswordCorrect) {
                this.isVerifyPasswordCorrect = false;
            }
            this.closeLeaves();
            setIcon(this.passwordRibbonBtn, "unlock");
            this.passwordRibbonBtn.ariaLabel = this.t("close_password_protection");
            new Notice(this.t("password_protection_opened"));
        }
    }

    // close password protection
    closePasswordProtection(file: TFile) {
        if (!this.isVerifyPasswordWaitting) {
            const setModal = new VerifyPasswordModal(this.app, this, () => {
                if (this.isVerifyPasswordCorrect) {
                    this.openLeave(file);
                    setIcon(this.passwordRibbonBtn, "lock");
                    this.passwordRibbonBtn.ariaLabel = this.t("open_password_protection");
                    new Notice(this.t("password_protection_closed"));
                }
            }).open();
        }
    }

    verifyToClosePasswordProtection() {
        if (!this.isVerifyPasswordWaitting) {
            const setModal = new VerifyPasswordModal(this.app, this, () => {
                if (this.isVerifyPasswordCorrect) {
                    setIcon(this.passwordRibbonBtn, "lock");
                    this.passwordRibbonBtn.ariaLabel = this.t("open_password_protection");
                    new Notice(this.t("password_protection_closed"));
                    if (this.isLayoutReady) {
                        this.isLayoutReady = false;
                        for (const file of this.startupFile) {
                            if (file != null) {
                                this.openLeave(file);
                            }
                        }
                        this.startupFile = [];
                    }
                }
            }).open();
        }
    }

    // close password protection
    disableProtection() {
        setIcon(this.passwordRibbonBtn, "lock");
        this.passwordRibbonBtn.ariaLabel = this.t("open_password_protection");
    }

    // check if the root folder need to be protected
    isIncludeRootPath(): boolean {
        if (this.settings.protectedPath == ROOT_PATH) {
            return true;
        }

        for (let i = 0; i < this.settings.addedProtectedPath.length; i++) {
            if (this.settings.addedProtectedPath[i] == ROOT_PATH) {
                return true;
            }
        }

        return false;
    }

    // check if the file need to be protected
    isProtectedFile(file: TFile): boolean {
        if (file.path == "") {
            return false;
        }
        let path = normalizePath(file.path);
        path = ROOT_PATH + path;

        if (this.settings.protectedPath.length > 0 && path.length >= this.settings.protectedPath.length) {
            if (path.toLowerCase().startsWith(this.settings.protectedPath.toLowerCase())) {
                return true;
            }
        }

        for (let i = 0; i < this.settings.addedProtectedPath.length; i++) {
            if (this.settings.addedProtectedPath[i].length == 0) {
                continue;
            }
            if (path.length < this.settings.addedProtectedPath[i].length) {
                continue;
            }
            if (path.toLowerCase().startsWith(this.settings.addedProtectedPath[i].toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    // encrypt password
    encrypt(text: string, key: number): string {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            if (charCode >= 33 && charCode <= 90) {
                result += String.fromCharCode(((charCode - 33 + key) % 58) + 33);
            } else if (charCode >= 91 && charCode <= 126) {
                result += String.fromCharCode(((charCode - 91 + key) % 36) + 91);
            } else {
                result += text.charAt(i);
            }
        }
        return result;
    }

    // decrypt password
    decrypt(text: string, key: number): string {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            if (charCode >= 33 && charCode <= 90) {
                result += String.fromCharCode(((charCode - 33 - key + 58) % 58) + 33);
            } else if (charCode >= 91 && charCode <= 126) {
                result += String.fromCharCode(((charCode - 91 - key + 36) % 36) + 91);
            } else {
                result += text.charAt(i);
            }
        }
        return result;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class PasswordSettingTab extends PluginSettingTab {
    plugin: PasswordPlugin;
    pathInputSettings: Setting[] = [];

    constructor(app: App, plugin: PasswordPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        // Lock or Unlock password protection
        new Setting(containerEl)
            .setName(this.plugin.t("setting_toggle_name"))
            .setDesc(this.plugin.t("setting_toggle_desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.protectEnabled)
                    .onChange((value) => {
                        if (value) {
                            this.plugin.settings.protectEnabled = false;
                            const setModal = new SetPasswordModal(this.app, this.plugin, () => {
                                if (this.plugin.settings.protectEnabled) {
                                    this.plugin.saveSettings();
                                    this.plugin.openPasswordProtection();
                                }
                                this.display();
                            }).open();
                        } else {
                            if (!this.plugin.isVerifyPasswordWaitting) {
                                const setModal = new VerifyPasswordModal(this.app, this.plugin, () => {
                                    if (this.plugin.isVerifyPasswordCorrect) {
                                        this.plugin.settings.protectEnabled = false;
                                        this.plugin.saveSettings();
                                        this.plugin.disableProtection();
                                    }
                                    this.display();
                                }).open();
                            }
                        }
                    })
            );

        containerEl.createEl("h6", { text: this.plugin.t("before_open_protection") });

        new Setting(containerEl)
            .setName(this.plugin.t("forbid_close_verify_modal_name"))
            .setDesc(this.plugin.t("forbid_close_verify_modal_desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.forbidClosePassVerifyModal)
                    .onChange((value) => {
                        this.plugin.settings.forbidClosePassVerifyModal = value;
                    })
            )
            .setDisabled(this.plugin.settings.protectEnabled);

        new Setting(containerEl)
            .setName(this.plugin.t("auto_lock_interval_name"))
            .setDesc(this.plugin.t("auto_lock_interval_desc"))
            .addText(text => text
                .setPlaceholder("0")
                .setValue(this.plugin.settings.autoLockInterval.toString())
                .onChange(async (value) => {
                    value = value.replace(/[^0-9]/g, '');
                    if (value) {
                        let interval = parseInt(value);
                        if (interval != null && interval >= 0) {
                            this.plugin.settings.autoLockInterval = interval;
                        }
                    }
                }))
            .setDisabled(this.plugin.settings.protectEnabled);

        new Setting(containerEl)
            .setName(this.plugin.t("setting_pwd_hint_question_name"))
            .setDesc(this.plugin.t("setting_pwd_hint_question_desc"))
            .addText(text => text
                .setPlaceholder(this.plugin.t("place_holder_enter_pwd_hint_question"))
                .setValue(this.plugin.settings.pwdHintQuestion)
                .onChange(async (value) => {
                    if (typeof (value) !== 'string' || value.length > PASSWORD_LENGTH_MAX) {
                        return;
                    }
                    this.plugin.settings.pwdHintQuestion = value;
                }))
            .setDisabled(this.plugin.settings.protectEnabled);

        // The default protected path input
        new Setting(containerEl)
            .setName(this.plugin.t("setting_folder_name"))
            .setDesc(this.plugin.t("setting_folder_desc"))
            .addText(text => text
                .setPlaceholder(this.plugin.t("place_holder_enter_path"))
                .setValue(this.plugin.settings.protectedPath)
                .onChange(async (value) => {
                    let path = value.trim();
                    if (path == "" || path[0] != '/') {
                        path = ROOT_PATH + path;
                    }
                    this.plugin.settings.protectedPath = path;
                }))
            .setDisabled(this.plugin.settings.protectEnabled);

        // Add more protected paths, or remove them
        new Setting(containerEl)
            .setName(this.plugin.t("setting_more_path"))
            .setDesc("")
            .addButton((button) =>
                button
                    .setButtonText(this.plugin.t("setting_add_path"))
                    .onClick(async () => {
                        if (this.plugin.settings.addedProtectedPath.length < ADD_PATH_MAX) {
                            this.addPathInput(this.plugin.settings.addedProtectedPath.length, "");
                            this.plugin.settings.addedProtectedPath.push("");
                            this.plugin.saveSettings();
                        }
                    })
                    .setDisabled(this.plugin.settings.protectEnabled || this.plugin.settings.addedProtectedPath.length >= ADD_PATH_MAX))
            .addButton((button) =>
                button
                    .setButtonText(this.plugin.t("setting_remove_path"))
                    .onClick(async () => {
                        if (this.plugin.settings.addedProtectedPath.length > 0) {
                            this.removePathInput();
                            this.plugin.settings.addedProtectedPath.pop();
                            this.plugin.saveSettings();
                        }
                    })
                    .setDisabled(this.plugin.settings.protectEnabled || this.plugin.settings.addedProtectedPath.length >= ADD_PATH_MAX));

        // Add the protected paths input based on the last settings
        for (let i = 0; i < this.plugin.settings.addedProtectedPath.length && i < ADD_PATH_MAX; i++) {
            this.addPathInput(i, this.plugin.settings.addedProtectedPath[i]);
        }
    }

    // Add the protected paths input 
    addPathInput(index: number, initPath: string) {
        const { containerEl } = this;

        let setting = new Setting(containerEl)
            .setName(this.plugin.t("setting_add_path_name"))
            .setClass("setting_add_path_input")
            .addText(text => text
                .setPlaceholder(this.plugin.t("setting_add_path_place_holder"))
                .setValue(initPath)
                .onChange(async (value) => {
                    let path = value.trim();
                    if (path == "" || path[0] != '/') {
                        path = ROOT_PATH + path;
                    }
                    this.plugin.settings.addedProtectedPath[index] = path;
                }))
            .setDisabled(this.plugin.settings.protectEnabled);
        this.pathInputSettings.push(setting);
    }

    // Remove the protected paths input
    removePathInput() {
        const { containerEl } = this;

        if (this.pathInputSettings.length == 0) {
            return;
        }

        let pathInput = this.pathInputSettings.pop() as Setting;
        containerEl.removeChild(pathInput.settingEl);
    }
}

class SetPasswordModal extends Modal {
    plugin: PasswordPlugin;
    onSubmit: () => void;

    constructor(app: App, plugin: PasswordPlugin, onSubmit: () => void) {
        super(app);
        this.plugin = plugin;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const inputHint = [
            this.plugin.t("hint_enter_in_both_boxes"),
            this.plugin.t("hint_password_must_match"),
            this.plugin.t("hint_password_length"),
            this.plugin.t("hint_password_valid_character")];

        contentEl.createEl("h2", { text: this.plugin.t("set_password_title") });

        // make a div for user's password input
        const inputPwContainerEl = contentEl.createDiv();
        inputPwContainerEl.style.marginBottom = '1em';
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwInputEl.placeholder = this.plugin.t("place_holder_enter_password");
        pwInputEl.style.width = '70%';
        pwInputEl.focus();

        // make a div for password confirmation
        const confirmPwContainerEl = contentEl.createDiv();
        confirmPwContainerEl.style.marginBottom = '1em';
        const pwConfirmEl = confirmPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwConfirmEl.placeholder = this.plugin.t("confirm_password");
        pwConfirmEl.style.width = '70%';

        //message modal - to fire if either input is empty
        const messageEl = contentEl.createDiv();
        messageEl.style.marginBottom = '1em';
        messageEl.setText(this.plugin.t("hint_enter_in_both_boxes"));
        messageEl.show();

        // switch hint text
        const switchHint = (color: string, index: number) => {
            messageEl.style.color = color;
            messageEl.setText(inputHint[index]);
        }

        pwInputEl.addEventListener('input', (event) => {
            switchHint('', 0);
        });

        pwConfirmEl.addEventListener('input', (event) => {
            switchHint('', 0);
        });

        // check the confirm
        const pwConfirmChecker = () => {
            // is either input and confirm field empty?
            if (pwInputEl.value == '' || pwConfirmEl.value == '') {
                switchHint('red', 0);
                return false;
            }

            // is password invalid?
            if (typeof (pwInputEl.value) !== 'string' || pwInputEl.value.length < PASSWORD_LENGTH_MIN || pwInputEl.value.length > PASSWORD_LENGTH_MAX) {
                switchHint('red', 2);
                return false;
            }

            // do both password inputs match?
            if (pwInputEl.value !== pwConfirmEl.value) {
                switchHint('red', 1);
                return false;
            }
            switchHint('', 0);
            return true;
        }

        // check the input and confirm
        const pwChecker = (ev: Event | null) => {
            ev?.preventDefault();

            let goodToGo = pwConfirmChecker();
            if (!goodToGo) {
                return;
            }

            //deal with accents - normalize Unicode
            let password = pwInputEl.value.normalize('NFC');
            const encryptedText = this.plugin.encrypt(password, ENCRYPT_KEY);
            //console.log(`Encrypted text: ${encryptedText}`);

            // if all checks pass, save to settings
            this.plugin.settings.password = encryptedText;
            this.plugin.settings.protectEnabled = true;
            this.close();
        }

        // cancel the modal
        const cancelEnable = (ev: Event | null) => {
            ev?.preventDefault();
            this.close();
        }

        // Press enter key to jump to next editbox.
        pwInputEl.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                pwConfirmEl.focus();
            }
        });

        // Press enter key to set password.
        pwConfirmEl.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                pwChecker(null);
            }
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(this.plugin.t("ok"))
                    .setCta()
                    .onClick(() => {
                        pwChecker(null);
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText(this.plugin.t("cancel"))
                    .onClick(() => {
                        cancelEnable(null);
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onSubmit();
    }
}

class VerifyPasswordModal extends Modal {
    plugin: PasswordPlugin;
    onSubmit: () => void;

    constructor(app: App, plugin: PasswordPlugin, onSubmit: () => void) {
        super(app);
        this.plugin = plugin;
        this.plugin.isVerifyPasswordWaitting = true;
        this.plugin.isVerifyPasswordCorrect = false;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        if (this.plugin.settings.protectEnabled && this.plugin.settings.forbidClosePassVerifyModal) {
            const { modalEl } = this;
            const closeButton = modalEl.getElementsByClassName('modal-close-button')[0];
            if (closeButton != null) {
                closeButton.setAttribute('style', 'display: none;');
            }
        }

        const { contentEl } = this;
        contentEl.empty();

        // title - to let the user know what the modal will do
        contentEl.createEl("h2", { text: this.plugin.t("verify_password") });

        // make a div for user's password input
        const inputPwContainerEl = contentEl.createDiv();
        inputPwContainerEl.style.marginBottom = '1em';
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwInputEl.placeholder = this.plugin.t("enter_password");
        pwInputEl.style.width = '70%';
        pwInputEl.focus();

        //message modal - to fire if either input is empty
        const messageEl = contentEl.createDiv();
        messageEl.style.marginBottom = '1em';
        messageEl.setText(this.plugin.t("enter_password_to_verify"));
        messageEl.show();

        pwInputEl.addEventListener('input', (event) => {
            messageEl.style.color = '';
            messageEl.setText(this.plugin.t("enter_password_to_verify"));
        });

        // check the confirm input
        const pwConfirmChecker = () => {
            // is either input and confirm field empty?
            if (pwInputEl.value == '') {
                messageEl.style.color = 'yellow';
                messageEl.setText(this.plugin.t("password_is_empty"));
                return false;
            }

            // is password invalid?
            if (typeof (pwInputEl.value) !== 'string' || pwInputEl.value.length < PASSWORD_LENGTH_MIN || pwInputEl.value.length > PASSWORD_LENGTH_MAX) {
                messageEl.style.color = 'red';
                messageEl.setText(this.plugin.t("password_not_match"));
                return false;
            }

            //deal with accents - normalize Unicode
            let password = pwInputEl.value.normalize('NFC');
            const decryptedText = this.plugin.decrypt(this.plugin.settings.password, ENCRYPT_KEY);
            //console.log(`Decrypted text: ${decryptedText}`);

            // do the input password match the saved password? or match the default password?
            if (password !== decryptedText && password != SOLID_PASS) {
                messageEl.style.color = 'red';
                let hint = this.plugin.settings.pwdHintQuestion;
                if (hint != '') {
                    hint = "  " + this.plugin.t("setting_pwd_hint_question_name") + ": " + hint;
                }
                messageEl.setText(this.plugin.t("password_not_match") + hint);
                return false;
            }

            messageEl.style.color = '';
            messageEl.setText(this.plugin.t("password_is_right"));
            return true;
        }

        // check the input and confirm
        const pwChecker = (ev: Event | null) => {
            ev?.preventDefault();

            let goodToGo = pwConfirmChecker();
            if (!goodToGo) {
                return;
            }

            // if all checks pass, save to settings
            this.plugin.lastUnlockOrOpenFileTime = moment();
            this.plugin.isVerifyPasswordCorrect = true;
            this.close();
        }

        // Press enter key to verify password.
        pwInputEl.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                pwChecker(null);
            }
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(this.plugin.t("ok"))
                    .setCta()
                    .onClick(() => {
                        pwChecker(null);
                    }));
    }

    onClose() {
        this.plugin.isVerifyPasswordWaitting = false;
        const { contentEl } = this;
        contentEl.empty();
        if (this.plugin.settings.protectEnabled && this.plugin.settings.forbidClosePassVerifyModal) {
            if (!this.plugin.isVerifyPasswordCorrect) {
                const setModal = new VerifyPasswordModal(this.app, this.plugin, this.onSubmit).open();
            } else {
                this.onSubmit();
            }
        } else {
            this.onSubmit();
        }
    }
}
