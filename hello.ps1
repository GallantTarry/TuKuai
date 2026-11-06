# 1. 召唤 Windows 媒体播放器内核，直接流式播放云端的 MP3
$wmp = New-Object -ComObject WMPlayer.OCX
$wmp.settings.volume = 100
# 替换为你实际的 MP3 云端直链
$wmp.URL = "https://xn--udsye.art/土块留言.mp3"
$wmp.controls.play()

# 稍微停顿一下，让背景音先出来
Start-Sleep -Seconds 1

# 2. 清屏，营造沉浸式氛围
Clear-Host
Start-Sleep -Seconds 1

# 3. 准备长篇英文独白内容 (使用 Here-String 保持段落)
$monologue = @"
Hello World... Hello, friend. My name is Tukuai. If you happen to be listening to this right now... then you and I, we must share quite a special connection. So... allow an older guy to share a few hard-earned thoughts with you. It’s nothing academic, and by no means rigorous, but... it’s the honest truth from my own journey through life.

Number one... and this is the most crucial part: people are wired differently. Our passions are rarely the same. Some men chase women; some love sports; some lose themselves in video games; and others can sit by a misty river all day, just waiting on a fish. But whatever it is for you... you must find the one thing you love more than anything else. In my eyes, that singular passion is the bedrock of ever achieving something truly meaningful in this world.

Number two... find whatever natural gift God or the universe handed you. You see, passion alone isn't quite enough. In this life, you might fall in love with a dozen different pursuits... but which one do you actually build your life upon? That comes down to what you're naturally built for. Leaving aside deliberate practice for a second... let's face a brutal truth: sometimes, life shuts every door in your face. It's entirely possible to feel like you're not particularly gifted at anything. That happens to a lot of us. But... if life wasn't entirely ruthless, and left you with even the smallest flicker of natural inclination... you damn well better grab onto it. Think about it: if your arms happen to be unusually long, you're naturally built for swimming. If you were born with an obsessive palate, you could become a legendary food critic. If your hair is remarkably thick and long, you could model for hair stylists. So never sit around feeling sorry for yourself, claiming you have no talents. Even if your talent is just unusually long arms, unusually long hair, or an unusually long tongue... right? That's still your distinct edge in this world.

And number three... love this world. Love it with everything you've got. This is something I've spent decades turning over in my mind. It reminds me of what Bertrand Russell once said: tolerance, and the pursuit of truth. When people betray or hurt you, you don't have to forgive them. But you must remain tolerant of the world at large. Don't go through life thinking your sorrow is unique. Have you ever considered that nearly every human being walking this earth has survived terrible, unspeakable things? It's just that some couldn't bear it and passed away... while those who survived made the quiet choice to smile through the ache. So stop clinging to old grudges.

And as for truth... God knows how hard it is to come by. Even a guy like me catches himself talking nonsense now and then. Even when it's not an outright lie, there's always that urge to polish and embellish the story. Speaking pure, unvarnished truth is damn hard. But if your bluff is easily seen through, well, at least you're not a genuinely deceitful soul. But truth isn't just about what comes out of your mouth—it's an uncompromising attitude toward reality and your own soul. Never bow blindly to the so-called experts, the elders, the industry gurus, or whoever is shouting from the rooftops about what's dead, what's hot, or what makes the quickest buck. Just look into your own damn heart. Take a long, honest look at yourself... and then march straight into that vast, uncertain future. Even if you fall flat on your face, even if you fail completely... it was still worth every single second. Because your entire life was dedicated to what you genuinely loved. And when your time comes... you won't be looking back with a mountain of regrets.
"@

# 4. 按行拆分并逐字打印到终端，模拟老式打字机效果
$lines = $monologue -split "`n"
foreach ($line in $lines) {
    if ($line.Trim() -eq "") {
        Write-Host ""
        Start-Sleep -Milliseconds 800
        continue
    }
    
    foreach ($char in $line.ToCharArray()) {
        Write-Host -NoNewline $char -ForegroundColor Cyan
        
        # 打字节奏控制，标点符号稍作停顿
        if ($char -match "[.,!?]") {
            Start-Sleep -Milliseconds 150
        } else {
            Start-Sleep -Milliseconds 30
        }
    }
    Write-Host ""
    Start-Sleep -Milliseconds 600
}

# 5. 等待音频播完，防止后台音乐中断
Write-Host ""
Write-Host "[END OF TRANSMISSION]" -ForegroundColor DarkGray
Start-Sleep -Seconds 180