import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, setIcon, WorkspaceLeaf, FileView } from 'obsidian';

const ENCRYPT_KEY = 30;

interface PasswordPluginSettings {
    protectedPath: string;
    protectEnabled: boolean;
    password: string;
}

const DEFAULT_SETTINGS: PasswordPluginSettings = {
    protectedPath: '/',
    protectEnabled: false,
    password: '',
}

export default class PasswordPlugin extends Plugin {
    settings: PasswordPluginSettings;
    isVerifyPasswordWaitting: boolean = false;
    isVerifyPasswordCorrect: boolean = false;

    passwordRibbonBtn: HTMLElement;

    async onload() {
        await this.loadSettings();

        // This creates an icon in the left ribbon.
        if (this.settings.protectEnabled) {
            this.passwordRibbonBtn = this.addRibbonIcon('unlock', 'Close password protection', (evt: MouseEvent) => {
                this.switchPasswordProtection();
            });
        } else {
            this.passwordRibbonBtn = this.addRibbonIcon('lock', 'Open password protection', (evt: MouseEvent) => {
                this.switchPasswordProtection();
            });
        }

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'Password: Open password protection',
            name: 'Open password protection',
            callback: () => {
                this.OpenPasswordProtection();
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new PasswordSettingTab(this.app, this));

        // when the layout is ready, check if the root folder need to be protected, if so, close all notes, show the password dialog
        this.app.workspace.onLayoutReady(() => {
            if (this.settings.protectEnabled && this.settings.protectedPath == '/') {
                if (!this.isVerifyPasswordCorrect) {
                    this.closeLeaves(null);
                    this.ClosePasswordProtection(null);
                }
            }
        });

        // when the file opened, check if it need to be protected, if so, close it, and show the password dialog
        this.registerEvent(this.app.workspace.on('file-open', (file: TFile) => {
            if (file !== null)
            {
                if (this.settings.protectEnabled && !this.isVerifyPasswordCorrect && this.isProtectedFile(file)) {
                    // firstly close the file, then show the password dialog
                    this.closeLeaves(file);
                    this.ClosePasswordProtection(file);
                }
            }
        }));
    }

    onunload() {
    }

    // open note
    async openLeave(file: TFile | null) {
        var leaf = this.app.workspace.getLeaf(false);
        if (leaf != null && file != null) {
            leaf.openFile(file);
        }
    }

    // close notes
    async closeLeaves(file: TFile | null) {
        let leaves: WorkspaceLeaf[] = [];

        this.app.workspace.iterateAllLeaves((leaf) => {
            leaves.push(leaf);
        });

        const emptyLeaf = async (leaf: WorkspaceLeaf): Promise<void> => {
            leaf.setViewState({ type: 'empty' });
        }

        for (const leaf of leaves) {
            if (leaf.view instanceof FileView) {
                let needClose = false;
                if (file == null) {
                    needClose = this.isProtectedFile(leaf.view.file);
                } else if (leaf.view.file.path == file.path) {
                    needClose = true;
                }

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
                this.ClosePasswordProtection(null);
            } else {
                this.OpenPasswordProtection();
            }
        } else {
            this.OpenPasswordProtection();
        }
    }

    // open password protection
    OpenPasswordProtection() {
        if (!this.settings.protectEnabled) {
            new Notice("Please firstly set password in the setting of Password Protection plugin!");
        } else {
            if (this.isVerifyPasswordCorrect) {
                this.isVerifyPasswordCorrect = false;
            }
            this.closeLeaves(null);
            setIcon(this.passwordRibbonBtn, "unlock");
            this.passwordRibbonBtn.ariaLabel = "Close password protection";
            new Notice("Password protection is opened!");
        }
    }

    // close password protection
    ClosePasswordProtection(file: TFile | null) {
        if (!this.settings.protectEnabled) {
            setIcon(this.passwordRibbonBtn, "lock");
            this.passwordRibbonBtn.ariaLabel = "Open password protection";
        } else {
            if (!this.isVerifyPasswordCorrect) {
                if (!this.isVerifyPasswordWaitting) {
                    const setModal = new VerifyPasswordModal(this.app, this, () => {
                        if (this.isVerifyPasswordCorrect) {
                            if (file != null) {
                                this.openLeave(file);
                            }
                            setIcon(this.passwordRibbonBtn, "lock");
                            this.passwordRibbonBtn.ariaLabel = "Open password protection";
                            new Notice("Password protection is closed!");
                        }
                    }).open();
                }
            }
        }
    }

    // check if the file need to be protected
    isProtectedFile(file: TFile): boolean {
        if (file === null) {
            return false;
        }
        var path = file.path.toLowerCase();
        if (file.path[0] != '/') {
            path = '/' + path;
        }
        const lastSlashIndex = path.lastIndexOf("/");
        const filePath = path.substring(0, lastSlashIndex + 1);

        var protectedPath = this.settings.protectedPath.toLowerCase();
        if (protectedPath[0] != '/') {
            protectedPath = '/' + protectedPath;
        }
        if (protectedPath[protectedPath.length - 1] != '/') {
            protectedPath = protectedPath + '/';
        }

        if (filePath < protectedPath) {
            return false;
        }

        if (filePath.startsWith(this.settings.protectedPath)) {
            return true;
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

    constructor(app: App, plugin: PasswordPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'Setting for Password Protection plugin.'});

        new Setting(containerEl)
            .setName('The folder need to be protected')
            .setDesc('With relative path, the \'/\' is the root path of vault folder')
            .addText(text => text
                .setPlaceholder('Enter path')
                .setValue(this.plugin.settings.protectedPath)
                .onChange(async (value) => {
                    var path = value.toLowerCase();
                    if (path.length == 0 || path[0] != '/') {
                        path = '/' + path;
                    }
                    if (path[path.length - 1] != '/') {
                        path = path + '/';
                    }
                    this.plugin.settings.protectedPath = path;
                }))
            .setDisabled(this.plugin.settings.protectEnabled);

        new Setting(containerEl)
            .setName(`Enable protecting folder with password.`)
            .setDesc(`A password will be required to enable or disable the protection.`)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.protectEnabled)
                    .onChange((value) => {
                        if (value) {
                            //console.log('Enable the protection');
                            this.plugin.settings.protectEnabled = false;
                            const setModal = new SetPasswordModal(this.app, this.plugin, () => {
                                if (this.plugin.settings.protectEnabled) {
                                    this.plugin.saveSettings();
                                    this.plugin.OpenPasswordProtection();
                                }
                                this.display();
                            }).open();
                        } else {
                            //console.log('Disable the protection');
                            if (!this.plugin.isVerifyPasswordWaitting) {
                                const setModal = new VerifyPasswordModal(this.app, this.plugin, () => {
                                    if (this.plugin.isVerifyPasswordCorrect) {
                                        this.plugin.settings.protectEnabled = false;
                                        this.plugin.saveSettings();
                                        this.plugin.ClosePasswordProtection(null);
                                    }
                                    this.display();
                                }).open();
                            }
                        }
                    })
            );
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

        var inputHint = [
            'Please enter your password in both boxes.',
            'Passwords must match.',
            'Password must be valid characters and contains 6~20 characters.',
            'Password is valid.'];

        // title - to let the user know what the modal will do
        const titleEl = contentEl.createDiv();
        titleEl.style.fontWeight = 'bold';
        titleEl.style.marginBottom = '1em';
        titleEl.setText('Set a password to protect a folder');

        // make a div for user's password input
        const inputPwContainerEl = contentEl.createDiv();
        inputPwContainerEl.style.marginBottom = '1em';
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwInputEl.placeholder = 'Enter password, 6~20 characters';
        pwInputEl.style.width = '70%';
        pwInputEl.focus();

        // make a div for password confirmation
        const confirmPwContainerEl = contentEl.createDiv();
        confirmPwContainerEl.style.marginBottom = '1em';
        const pwConfirmEl = confirmPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwConfirmEl.placeholder = 'Confirm your password';
        pwConfirmEl.style.width = '70%';

        //message modal - to fire if either input is empty
        const messageEl = contentEl.createDiv();
        messageEl.style.marginBottom = '1em';
        messageEl.setText('Please enter your password in both boxes.');
        messageEl.show();

        // make a div for save and cancel button
        //const buttonContainerEl = contentEl.createDiv();
        //buttonContainerEl.style.marginBottom = '1em';
        //const saveBtnEl = buttonContainerEl.createEl('button', { text: 'Save' });
        //saveBtnEl.style.marginLeft = '1em';
        //const cancelBtnEl = buttonContainerEl.createEl('button', { text: 'Cancel' });
        //cancelBtnEl.style.marginLeft = '1em';

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
            if (pwInputEl.value == '' || pwInputEl.value == null || pwConfirmEl.value == '' || pwConfirmEl.value == null) {
                switchHint('red', 0);
                return false;
            }

            // is password invalid?
            if (typeof (pwInputEl.value) !== 'string' || pwInputEl.value.length < 6 || pwInputEl.value.length > 20) {
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
            if (ev != null) {
                ev.preventDefault();
            }

            let goodToGo = pwConfirmChecker();
            if (!goodToGo) {
                return;
            }

            //deal with accents - normalize Unicode
            var password = pwInputEl.value.normalize('NFC');
            const encryptedText = this.plugin.encrypt(password, ENCRYPT_KEY);

            // if all checks pass, save to settings
            this.plugin.settings.password = encryptedText;
            this.plugin.settings.protectEnabled = true;
            this.close();
        }

        // cancel the modal
        const cancelEnable = (ev: Event | null) => {
            if (ev != null) {
                ev.preventDefault();
            }
            this.close();
        }

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        pwChecker(null);
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText("Cancel")
                    .onClick(() => {
                        cancelEnable(null);
                    }));

        //register the button's event handler
        //saveBtnEl.addEventListener('click', pwChecker);
        //cancelBtnEl.addEventListener('click', cancelEnable);
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
        const { contentEl } = this;
        contentEl.empty();

        // title - to let the user know what the modal will do
        const titleEl = contentEl.createDiv();
        titleEl.style.fontWeight = 'bold';
        titleEl.style.marginBottom = '1em';
        titleEl.setText('Verify password');

        // make a div for user's password input
        const inputPwContainerEl = contentEl.createDiv();
        inputPwContainerEl.style.marginBottom = '1em';
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: '' });
        pwInputEl.placeholder = 'Enter your password';
        pwInputEl.style.width = '70%';
        pwInputEl.focus();

        //message modal - to fire if either input is empty
        const messageEl = contentEl.createDiv();
        messageEl.style.marginBottom = '1em';
        messageEl.setText('Please enter you password to verify.');
        messageEl.show();

        // make a div for save and cancel button
        //const buttonContainerEl = contentEl.createDiv();
        //buttonContainerEl.style.marginBottom = '1em';
        //const saveBtnEl = buttonContainerEl.createEl('button', { text: 'Ok' });
        //saveBtnEl.style.marginLeft = '1em';
        //const cancelBtnEl = buttonContainerEl.createEl('button', { text: 'Cancel' });
        //cancelBtnEl.style.marginLeft = '1em';

        pwInputEl.addEventListener('input', (event) => {
            messageEl.style.color = '';
            messageEl.setText('Please enter you password to verify.');
        });

        // check the confirm input
        const pwConfirmChecker = () => {
            // is either input and confirm field empty?
            if (pwInputEl.value == '' || pwInputEl.value == null) {
                messageEl.style.color = 'red';
                messageEl.setText('Password is empty.');
                return false;
            }

            // is password invalid?
            if (typeof (pwInputEl.value) !== 'string' || pwInputEl.value.length < 6 || pwInputEl.value.length > 20) {
                messageEl.style.color = 'red';
                messageEl.setText('Password isn\'t match.');
                return false;
            }

            //deal with accents - normalize Unicode
            var password = pwInputEl.value.normalize('NFC');
            const decryptedText = this.plugin.decrypt(this.plugin.settings.password, ENCRYPT_KEY);
            //console.log(`Decrypted text: ${decryptedText}`);

            // do both password inputs match?
            if (password !== decryptedText) {
                messageEl.style.color = 'red';
                messageEl.setText('Password isn\'t match.');
                return false;
            }

            messageEl.style.color = '';
            messageEl.setText('Password is right.');
            return true;
        }

        // check the input and confirm
        const pwChecker = (ev: Event | null) => {
            if (ev != null) {
                ev.preventDefault();
            }

            let goodToGo = pwConfirmChecker();
            if (!goodToGo) {
                return;
            }

            // if all checks pass, save to settings
            this.plugin.isVerifyPasswordCorrect = true;
            this.close();
        }

        // cancel the modal
        const cancelEnable = (ev: Event | null) => {
            if (ev != null) {
                ev.preventDefault();
            }
            this.close();
        }

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        pwChecker(null);
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText("Cancel")
                    .onClick(() => {
                        cancelEnable(null);
                    }));

        //register the button's event handler
        //saveBtnEl.addEventListener('click', pwChecker);
        //cancelBtnEl.addEventListener('click', cancelEnable);
    }

    onClose() {
        this.plugin.isVerifyPasswordWaitting = false;
        const { contentEl } = this;
        contentEl.empty();
        this.onSubmit();
    }
}
