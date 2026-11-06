# 1. 语音播报：召唤 SAPI 语音接口
$voice = New-Object -ComObject SAPI.SpVoice
# 语速稍微调快一点（-10 到 10，0是默认）
$voice.Rate = 1 
# 异步朗读，这样语音还没播完，记事本就已经弹出来了
$voice.Speak("helloworld，欢迎少侠访问土块终端", 1) 

# 2. 启动记事本，并获取它的进程 ID 以确保精准控制
$notepad = Start-Process notepad -PassThru
Start-Sleep -Seconds 1 # 停顿 1 秒，等待记事本完全打开

# 3. 将记事本窗口强制拉到屏幕最前面
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate($notepad.Id)
Start-Sleep -Milliseconds 500

# 4. 加载 .NET 窗体类，为了调用系统的剪贴板
Add-Type -AssemblyName System.Windows.Forms

# 5. 准备“幽灵打字”的内容
$messages = @(
    "Hello World...",
    "{ENTER}",
    "系统警告：该终端已被 土块.art 接管！",
    "{ENTER}",
    "哈哈，少侠别慌，这只是一次赛博空间的魔法展示。",
    "{ENTER}",
    "祝 TuKuai OS 越来越酷，今天敲代码 0 Bug！"
)

# 6. 开始模拟真实人类打字
foreach ($line in $messages) {
    if ($line -eq "{ENTER}") {
        # 遇到换行标记，直接模拟敲击回车键
        $wshell.SendKeys("{ENTER}")
    } else {
        # 逐字拆解，利用剪贴板秒变文字，防止触发拼音输入法
        foreach ($char in $line.ToCharArray()) {
            [System.Windows.Forms.Clipboard]::SetText($char.ToString())
            $wshell.SendKeys("^v") # 模拟 Ctrl + V
            Start-Sleep -Milliseconds 120 # 控制打字速度，120毫秒一个字
        }
    }
    Start-Sleep -Milliseconds 400 # 每打完一句话停顿一下，显得更真实
}

# 7. 打字结束后清理剪贴板，深藏功与名
[System.Windows.Forms.Clipboard]::Clear()