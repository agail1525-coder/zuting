; ZuTing v4.0 — Inno Setup 安装脚本
; 编译: ISCC installer.iss (需安装 Inno Setup 6)

[Setup]
AppId={{8A4F2D6E-3B7C-4E9A-A1D5-F6C8B2E7D9A3}
AppName=全球祖庭之旅
AppVersion=4.0
AppVerName=全球祖庭之旅 v4.0
AppPublisher=JOINUS.COM
AppPublisherURL=https://joinus.com
AppSupportURL=https://joinus.com
AppUpdatesURL=https://joinus.com
DefaultDirName={autopf}\ZuTing
DefaultGroupName=全球祖庭之旅
DisableProgramGroupPage=yes
LicenseFile=
OutputDir=installer_output
OutputBaseFilename=ZuTing-v4.0-Setup
SetupIconFile=zuting.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "快捷方式:"; Flags: checked
Name: "startmenu"; Description: "创建开始菜单快捷方式"; GroupDescription: "快捷方式:"; Flags: checked

[Files]
Source: "dist\ZuTing\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autodesktop}\全球祖庭之旅"; Filename: "{app}\ZuTing.exe"; Tasks: desktopicon; IconFilename: "{app}\zuting.ico"
Name: "{group}\全球祖庭之旅"; Filename: "{app}\ZuTing.exe"; Tasks: startmenu; IconFilename: "{app}\zuting.ico"
Name: "{group}\卸载 全球祖庭之旅"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\ZuTing.exe"; Description: "立即启动 全球祖庭之旅"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\.cache"
Type: files; Name: "{app}\settings.json"

[Messages]
WelcomeLabel1=欢迎安装 全球祖庭之旅 v4.0
WelcomeLabel2=JOINUS.COM — 加入我们，探索世界%n%n12大信仰 · 200+圣地 · 260+祖庭 · AI小鸿修行助手%n%n帮助100万人走祖庭，建立全球宗教文化和平使者网络
FinishedLabel=全球祖庭之旅 已安装完成。%n%n愿力不退，精进不止！
