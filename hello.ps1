Add-Type -AssemblyName presentationCore

# 1. 确保音频就绪（优先使用本地同目录文件或快速缓存到系统临时目录）
$tempAudio = Join-Path $env:TEMP "tukuai_msg.mp3"
$audioUrl = "https://xn--udsye.art/msg.mp3"
$localAudio = if ($PSScriptRoot) { Join-Path $PSScriptRoot "msg.mp3" } else { Join-Path (Get-Location) "msg.mp3" }

$audioPath = ""
if (Test-Path $localAudio) {
    $audioPath = $localAudio
} elseif (Test-Path $tempAudio -and (Get-Item $tempAudio).Length -ge 1000000) {
    $audioPath = $tempAudio
} else {
    try {
        (New-Object System.Net.WebClient).DownloadFile($audioUrl, $tempAudio)
        $audioPath = $tempAudio
    } catch {
        $audioPath = $audioUrl
    }
}

# 2. 启动 .NET 原生高品质媒体播放器
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open([System.Uri]$audioPath)
$player.Volume = 1.0
$player.Play()

# 备用播放方案（双重冗余）
$wmp = $null
try {
    $wmp = New-Object -ComObject WMPlayer.OCX
    $wmp.settings.volume = 100
    $wmp.URL = $audioPath
    $wmp.controls.play()
} catch {}

# 3. 营造终端黑客极客绿氛围
Clear-Host
$Host.UI.RawUI.WindowTitle = "Tukuai - Terminal Monologue [Audio Synced]"
Write-Host "[ESTABLISHING SECURE AUDIO LINK...]" -ForegroundColor DarkGreen
Start-Sleep -Milliseconds 300
Write-Host "[CONNECTED TO AUDIO SOURCE: $audioPath]" -ForegroundColor DarkGreen
Start-Sleep -Milliseconds 200
Write-Host "[INITIALIZING AUDIO DECRYPTION STREAM...]" -ForegroundColor DarkGreen
Start-Sleep -Milliseconds 300
Write-Host ""

# 4. 精确时间轴（匹配音频 04:20 真实语速与停顿）
$timeline = @(
    # --- 序言 ---
    @{ t = 0.0;   text = "Hello World... "; br = $false },
    @{ t = 2.5;   text = "Hello, friend. "; br = $false },
    @{ t = 4.8;   text = "My name is Tukuai. "; br = $false },
    @{ t = 7.2;   text = "If you happen to be listening to this right now... "; br = $false },
    @{ t = 10.5;  text = "then you and I, we must share quite a special connection. "; br = $false },
    @{ t = 14.2;  text = "So... allow an older guy to share a few hard-earned thoughts with you. "; br = $false },
    @{ t = 18.8;  text = "It's nothing academic, and by no means rigorous, but... "; br = $false },
    @{ t = 23.2;  text = "it's the honest truth from my own journey through life."; br = $true },

    # --- 第一点 ---
    @{ t = 27.0;  text = "Number one... and this is the most crucial part: "; br = $false },
    @{ t = 30.5;  text = "people are wired differently. "; br = $false },
    @{ t = 32.8;  text = "Our passions are rarely the same. "; br = $false },
    @{ t = 35.8;  text = "Some men chase women; "; br = $false },
    @{ t = 37.8;  text = "some love sports; "; br = $false },
    @{ t = 39.5;  text = "some lose themselves in video games; "; br = $false },
    @{ t = 42.5;  text = "and others can sit by a misty river all day, just waiting on a fish. "; br = $false },
    @{ t = 47.0;  text = "But whatever it is for you... "; br = $false },
    @{ t = 49.2;  text = "you must find the one thing you love more than anything else. "; br = $false },
    @{ t = 53.5;  text = "In my eyes, that singular passion is the bedrock of ever achieving something truly meaningful in this world."; br = $true },

    # --- 第二点 ---
    @{ t = 59.0;  text = "Number two... find whatever natural gift God or the universe handed you. "; br = $false },
    @{ t = 65.2;  text = "You see, passion alone isn't quite enough. "; br = $false },
    @{ t = 68.8;  text = "In this life, you might fall in love with a dozen different pursuits... "; br = $false },
    @{ t = 73.8;  text = "but which one do you actually build your life upon? "; br = $false },
    @{ t = 77.2;  text = "That comes down to what you're naturally built for. "; br = $false },
    @{ t = 80.5;  text = "Leaving aside deliberate practice for a second... let's face a brutal truth: "; br = $false },
    @{ t = 85.5;  text = "sometimes, life shuts every door in your face. "; br = $false },
    @{ t = 89.5;  text = "It's entirely possible to feel like you're not particularly gifted at anything. "; br = $false },
    @{ t = 94.2;  text = "That happens to a lot of us. "; br = $false },
    @{ t = 97.0;  text = "But... if life wasn't entirely ruthless, and left you with even the smallest flicker of natural inclination... "; br = $false },
    @{ t = 104.2; text = "you damn well better grab onto it. "; br = $false },
    @{ t = 106.8; text = "Think about it: if your arms happen to be unusually long, you're naturally built for swimming. "; br = $false },
    @{ t = 113.2; text = "If you were born with an obsessive palate, you could become a legendary food critic. "; br = $false },
    @{ t = 118.8; text = "If your hair is remarkably thick and long, you could model for hair stylists. "; br = $false },
    @{ t = 124.8; text = "So never sit around feeling sorry for yourself, claiming you have no talents. "; br = $false },
    @{ t = 130.0; text = "Even if your talent is just unusually long arms, unusually long hair, or an unusually long tongue... right? "; br = $false },
    @{ t = 137.8; text = "That's still your distinct edge in this world."; br = $true },

    # --- 第三点 (前半) ---
    @{ t = 141.0; text = "And number three... love this world. "; br = $false },
    @{ t = 144.8; text = "Love it with everything you've got. "; br = $false },
    @{ t = 147.8; text = "This is something I've spent decades turning over in my mind. "; br = $false },
    @{ t = 151.8; text = "It reminds me of what Bertrand Russell once said: tolerance, and the pursuit of truth. "; br = $false },
    @{ t = 157.8; text = "When people betray or hurt you, you don't have to forgive them. "; br = $false },
    @{ t = 162.2; text = "But you must remain tolerant of the world at large. "; br = $false },
    @{ t = 166.2; text = "Don't go through life thinking your sorrow is unique. "; br = $false },
    @{ t = 169.8; text = "Have you ever considered that nearly every human being walking this earth has survived terrible, unspeakable things? "; br = $false },
    @{ t = 177.8; text = "It's just that some couldn't bear it and passed away... "; br = $false },
    @{ t = 181.8; text = "while those who survived made the quiet choice to smile through the ache. "; br = $false },
    @{ t = 185.5; text = "So stop clinging to old grudges."; br = $true },

    # --- 第三点 (后半：求真) ---
    @{ t = 188.0; text = "And as for truth... God knows how hard it is to come by. "; br = $false },
    @{ t = 193.5; text = "Even a guy like me catches himself talking nonsense now and then. "; br = $false },
    @{ t = 198.0; text = "Even when it's not an outright lie, there's always that urge to polish and embellish the story. "; br = $false },
    @{ t = 204.0; text = "Speaking pure, unvarnished truth is damn hard. "; br = $false },
    @{ t = 209.0; text = "But if your bluff is easily seen through, well, at least you're not a genuinely deceitful soul. "; br = $false },
    @{ t = 215.0; text = "But truth isn't just about what comes out of your mouth--"; br = $false },
    @{ t = 218.0; text = "it's an uncompromising attitude toward reality and your own soul. "; br = $false },
    @{ t = 223.0; text = "Never bow blindly to the so-called experts, the elders, the industry gurus, or whoever is shouting from the rooftops about what's dead, what's hot, or what makes the quickest buck. "; br = $false },
    @{ t = 235.0; text = "Just look into your own damn heart. "; br = $false },
    @{ t = 238.0; text = "Take a long, honest look at yourself... "; br = $false },
    @{ t = 241.5; text = "and then march straight into that vast, uncertain future. "; br = $false },
    @{ t = 245.0; text = "Even if you fall flat on your face, even if you fail completely... it was still worth every single second. "; br = $false },
    @{ t = 252.0; text = "Because your entire life was dedicated to what you genuinely loved. "; br = $false },
    @{ t = 258.0; text = "And when your time comes... you won't be looking back with a mountain of regrets."; br = $true }
)

# 5. 开始逐句同步打印
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    for ($i = 0; $i -lt $timeline.Count; $i++) {
        $item = $timeline[$i]
        
        # 等待音频播放进度到达该句子的开始时间点（结合硬件播放器进度与秒表）
        while ($true) {
            $currentPos = if ($player.Position.TotalSeconds -gt 0) { $player.Position.TotalSeconds } else { $stopwatch.Elapsed.TotalSeconds }
            if ($currentPos -ge $item.t) { break }
            Start-Sleep -Milliseconds 25
        }
        
        # 计算该句打字时长与每字符延迟（使文字随语速匀速吐出）
        $nextT = if ($i + 1 -lt $timeline.Count) { $timeline[$i + 1].t } else { $item.t + 3.0 }
        $dur = [Math]::Max(0.2, ($nextT - $item.t) * 0.82)
        $chars = $item.text.ToCharArray()
        $delay = [int](($dur / [Math]::Max(1, $chars.Count)) * 1000)

        # 极客绿逐字输出
        foreach ($c in $chars) {
            Write-Host -NoNewline $c -ForegroundColor Green
            Start-Sleep -Milliseconds $delay
        }

        # 段落结尾换行并添加空行
        if ($item.br) {
            Write-Host ""
            Write-Host ""
        }
    }

    Write-Host ""
    Write-Host "[END OF TRANSMISSION]" -ForegroundColor DarkGreen

    # 6. 等待音频彻底放完（避免掐断音乐）
    while ($player.Position.TotalSeconds -lt 259.0 -and $stopwatch.Elapsed.TotalSeconds -lt 262.0) {
        Start-Sleep -Milliseconds 500
    }
}
finally {
    if ($player) {
        $player.Stop()
        $player.Close()
    }
    if ($wmp) {
        $wmp.controls.stop()
    }
}
