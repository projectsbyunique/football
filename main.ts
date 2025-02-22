namespace SpriteKind {
    export const Field = SpriteKind.create()
    export const Quarterback = SpriteKind.create()
    export const NonPlayerPlayers = SpriteKind.create()
    export const Indicator = SpriteKind.create()
    export const Ball = SpriteKind.create()
    export const Endzone = SpriteKind.create()
    export const Defense = SpriteKind.create()
    export const Offense = SpriteKind.create()
    export const PlayerInEndzone = SpriteKind.create()
    export const PlayerWithPossession = SpriteKind.create()
    export const UI = SpriteKind.create()
    export const Misc = SpriteKind.create()
    export const PlayerPopup = SpriteKind.create()
    export const DefenderTackling = SpriteKind.create()
    export const DefenderThatTackled = SpriteKind.create()
    export const PlayerThatGotTackled = SpriteKind.create()
    export const PlayerThatCaught = SpriteKind.create()
    export const SackedQB = SpriteKind.create()
    export const alertGlare = SpriteKind.create()
}
/**
 * 70-50
 */
// 50-30=20
modes.whenModeChanged("preSnap", function (value) {
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Defense)
    sprites.destroyAllSpritesOfKind(SpriteKind.Indicator)
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerWithPossession)
    sprites.destroyAllSpritesOfKind(SpriteKind.DefenderThatTackled)
    sprites.destroyAllSpritesOfKind(SpriteKind.DefenderTackling)
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerPopup)
    sprites.destroyAllSpritesOfKind(SpriteKind.SackedQB)
    generate_OL()
    generate_DLine()
    draw_lines_at(value, yards_to_x(CurrentFirstDownLineYardage))
    _endzones.setKind(SpriteKind.Endzone)
    playFormationLines = sprites.create(assets.image`play1`, SpriteKind.Indicator)
    playFormationLines.setPosition(running_back.x - playFormationLines.width / 2, _qb.y)
    playFormationLines.z = _field.z + 1
    _play = 0
    _reciever = spriteutils.nullConsts(spriteutils.NullConsts.Null)
    recieverHasPossesion = false
    enableRecieverMovement = false
    CameraX = _qb.x - 30
    fancyText.setText(Downs, "" + [
    "1st",
    "2nd",
    "3rd",
    "4th"
    ][CurrentDown - 1] + " & " + Math.round(CurrentDownYardage))
    inGameAlert("MENU to Change Play")
    music.play(music.createSoundEffect(WaveShape.Sawtooth, 298, 1, 186, 255, 10, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
})
function endPlay (touchdown: boolean) {
    if (!(endingplay)) {
        endingplay = true
        for (let value of sprites.allOfKind(SpriteKind.Defense)) {
            value.setVelocity(0, 0)
            value.follow(null, 0)
        }
        for (let value2 of sprites.allOfKind(SpriteKind.Player)) {
            value2.setVelocity(0, 0)
            animation.stopAnimation(animation.AnimationTypes.All, value2)
            value2.setImage(assets.image`myImage3`)
        }
        if (touchdown) {
            inGameAlert("TOUCHDOWN!!")
            soundfx.touchdown()
            _reciever.x += -1
            sprites.destroy(_ball)
            for (let value3 of sprites.allOfKind(SpriteKind.Player)) {
                value3.setVelocity(0, 0)
                value3.follow(null)
                animation.stopAnimation(animation.AnimationTypes.All, value3)
                animation.runImageAnimation(
                value3,
                assets.animation`myAnim1`,
                500,
                true
                )
            }
            for (let value4 of sprites.allOfKind(SpriteKind.Defense)) {
                value4.setVelocity(0, 0)
                animation.stopAnimation(animation.AnimationTypes.All, value4)
                value4.setImage(flip(assets.image`myImage11`))
            }
            timer.after(1000, function () {
                _reciever.setVelocity(0, 0)
                animation.stopAnimation(animation.AnimationTypes.All, _reciever)
                animation.runImageAnimation(
                _reciever,
                assets.animation`myAnim1`,
                500,
                true
                )
            })
            pause(1000)
            return
        } else {
            if (_reciever != spriteutils.nullConsts(spriteutils.NullConsts.Null)) {
                animation.stopAnimation(animation.AnimationTypes.All, _reciever)
            }
            enableRecieverMovement = false
            pause(1000)
            for (let value5 of sprites.allOfKind(SpriteKind.Player)) {
                value5.setVelocity(0, 0)
                animation.stopAnimation(animation.AnimationTypes.All, value5)
                value5.setImage(assets.image`myImage3`)
            }
            if (modes.getCurrentMode() != "sack") {
                pauseUntil(() => _reciever != spriteutils.nullConsts(spriteutils.NullConsts.Undefined) && CurrentScrimYardage != spriteutils.nullConsts(spriteutils.NullConsts.Undefined))
            } else {
                pauseUntil(() => CurrentScrimYardage != spriteutils.nullConsts(spriteutils.NullConsts.Undefined))
            }
            if (_reciever != spriteutils.nullConsts(spriteutils.NullConsts.Null)) {
                if (_reciever.x > yards_to_x(CurrentScrimYardage)) {
                    console.log("Loss of yards")
                    if (CurrentDown < 4) {
                        CurrentDown += 1
                        CurrentScrimYardage = x_to_yards(_reciever.x)
                        CurrentDownYardage = CurrentScrimYardage - CurrentFirstDownLineYardage
                    } else {
                        end_possession(false)
                    }
                } else if (_reciever.x < yards_to_x(CurrentFirstDownLineYardage)) {
                    console.log("First down")
                    CurrentDown = 1
                    CurrentScrimYardage = x_to_yards(_reciever.x)
                    CurrentFirstDownLineYardage = CurrentScrimYardage - 10
                    CurrentDownYardage = 10
                } else if (_reciever.x > yards_to_x(CurrentFirstDownLineYardage) && _reciever.x < yards_to_x(CurrentScrimYardage)) {
                    console.log("Between the lines")
                    if (CurrentDown < 4) {
                        CurrentDown += 1
                        CurrentScrimYardage = x_to_yards(_reciever.x)
                        CurrentDownYardage = CurrentScrimYardage - CurrentFirstDownLineYardage
                    } else {
                        end_possession(false)
                    }
                }
                modes.setMode("preSnap", yards_to_x(CurrentScrimYardage))
            } else {
                console.log("Quarterback sacked")
                if (CurrentDown < 4) {
                    CurrentDown += 1
                    CurrentScrimYardage = x_to_yards(_qb.x)
                    CurrentDownYardage = CurrentScrimYardage - CurrentFirstDownLineYardage
                } else {
                    end_possession(false)
                }
                modes.setMode("preSnap", yards_to_x(CurrentScrimYardage))
            }
        }
        endingplay = false
    }
}
function generate_DLine () {
    playerInt = 0
    // Spawn D-Lineman
    for (let index2 = 0; index2 <= 4; index2++) {
        if (index2 == 2) {
            linebacker = sprites.create(assets.image`myImage11`, SpriteKind.Defense)
            linebacker.setPosition(_qb.x - 40, 60 - 18 + 6 * (index2 + 1))
            sprites.setDataNumber(linebacker, "num", playerInt)
        } else {
            defensive_tackle_end = sprites.create(assets.image`myImage1`, SpriteKind.Defense)
            defensive_tackle_end.setPosition(_qb.x - 18, 60 - 18 + 6 * (index2 + 1))
            sprites.setDataNumber(defensive_tackle_end, "num", playerInt)
        }
        playerInt += 1
    }
    // Spawn corners
    cb1 = sprites.create(assets.image`myImage11`, SpriteKind.Defense)
    cb1.setPosition(wr1.x - 12, 17)
    sprites.setDataNumber(cb1, "num", playerInt)
    playerInt += 1
    cb2 = sprites.create(assets.image`myImage11`, SpriteKind.Defense)
    cb2.setPosition(wr2.x - 12, 100)
    sprites.setDataNumber(cb2, "num", playerInt)
    playerInt += 1
    olb1 = sprites.create(assets.image`myImage11`, SpriteKind.Defense)
    olb1.setPosition(_qb.x - 32, 40)
    sprites.setDataNumber(olb1, "num", playerInt)
    playerInt += 1
    olb2 = sprites.create(assets.image`myImage11`, SpriteKind.Defense)
    olb2.setPosition(_qb.x - 32, 80)
    sprites.setDataNumber(olb2, "num", playerInt)
    playerInt += 1
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (modes.getCurrentMode() == "onPlay") {
        if (_reciever == spriteutils.nullConsts(spriteutils.NullConsts.Null)) {
            if (!(recieverHasPossesion)) {
                console.log("Qb will go for pass")
                music.play(music.createSoundEffect(WaveShape.Noise, 701, 1, 71, 255, 50, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
                throw_ball_fromto(_qb, wr1)
                timer.background(function () {
                    pauseUntil(() => enableRecieverMovement)
                    console.log("Pass completed")
                    music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 239, 186, 255, 10, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    animation.runImageAnimation(
                    _reciever,
                    assets.animation`myAnim`,
                    200,
                    true
                    )
                })
            } else {
                console.log("reciever HAS possesion")
            }
        } else {
            console.log("_reciever exists!")
        }
        _reciever.vx = sprites.readDataNumber(_reciever, "velocity") + 80
        if (enableRecieverMovement) {
            for (let index = 0; index < 5; index++) {
                _reciever.y += -1
                pause(10)
            }
        }
        _reciever.vx = sprites.readDataNumber(_reciever, "velocity")
    } else {
        console.log("WTF?")
    }
})
modes.whenModeChanged("sack", function (value) {
    timer.after(2600, function () {
        sprites.destroy(value)
        endPlay(false)
    })
})
function end_possession (kickoff_return: boolean) {
    modes.addMode("defense")
    modes.setMode("defense", kickoff_return)
    console.log("End of possession")
    CurrentDown = 1
    CurrentScrimYardage = 75.25
    CurrentFirstDownLineYardage = CurrentScrimYardage - 30
    CurrentDownYardage = CurrentScrimYardage - CurrentFirstDownLineYardage
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Defense)
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerWithPossession)
    sprites.destroyAllSpritesOfKind(SpriteKind.Indicator)
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerPopup)
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerInEndzone)
    sprites.destroyAllSpritesOfKind(SpriteKind.Ball)
    sprites.destroy(_reciever)
    if (CurrentTeam == CurrentHomeTeam) {
        opponentTeam = CurrentAwayTeam
    } else {
        opponentTeam = CurrentHomeTeam
    }
    simulatePossession()
    console.log(playLog)
    for (let value8 of playLog) {
        if (value8.includes("-")) {
            cutsceneYardage = parseInt(value8.split(" - ")[0])
            mainDefenseSplash = value8.split(" - ")[1]
            console.log(mainDefenseSplash)
            if (mainDefenseSplash.includes("TOUCHDOWN")) {
                set_splash_to(mainDefenseSplash, false, yards_to_x(100))
            } else {
                set_splash_to(mainDefenseSplash, false, yards_to_x(cutsceneYardage))
            }
        } else {
            set_splash_to(value8, false, yards_to_x(cutsceneYardage))
        }
        pauseUntil(() => controller.anyButton.isPressed())
    }
    for (let value6 of playLog) {
        if (value6.includes("TOUCHDOWN")) {
            if (CurrentTeam == CurrentHomeTeam) {
                AwayScore += 6
            } else {
                HomeScore += 6
            }
        }
    }
}
sprites.onOverlap(SpriteKind.Ball, SpriteKind.Defense, function (sprite, otherSprite) {
    if (Math.abs(spriteutils.distanceBetween(sprite, ballShadow)) < 4) {
        if (Math.abs(spriteutils.distanceBetween(otherSprite, _qb)) > 20) {
            if (!(recieverHasPossesion)) {
                if (!(enableRecieverMovement)) {
                    if (!(intercepted)) {
                        if (modes.getCurrentMode() == "onPlay") {
                            intercepted = true
                            animation.runImageAnimation(
                            otherSprite,
                            assets.animation`myAnim2`,
                            200,
                            true
                            )
                            otherSprite.follow(null)
                            otherSprite.setVelocity(20, 0)
                            sprite.setFlag(SpriteFlag.Invisible, true)
                            ballShadow.setFlag(SpriteFlag.Invisible, true)
                            for (let value62 of sprites.allOfKind(SpriteKind.Player)) {
                                value62.follow(otherSprite, 20)
                            }
                            spriteutils.onSpriteUpdateInterval(_ball, 20, function (sprite) {
                                CameraX = otherSprite.x
                            })
                        }
                    }
                }
            }
        }
    }
})
function throw_ball_fromto (passer: Sprite, reciever: Sprite) {
    _reciever = reciever
    reciever.setKind(SpriteKind.PlayerThatCaught)
    _ball = sprites.create(img`
        e 1 e 
        c c c 
        `, SpriteKind.Ball)
    ballShadow = sprites.create(img`
        c . c 
        . c . 
        `, SpriteKind.Misc)
    animation.runImageAnimation(
    _ball,
    [img`
        e 1 e 
        c c c 
        `,img`
        e e e 
        c 1 c 
        `],
    75,
    true
    )
    _ball.setPosition(passer.x, passer.y)
    ballShadow.setPosition(passer.x, passer.y)
    ballShadow.z = -48
    sprites.destroyAllSpritesOfKind(SpriteKind.Indicator)
    spriteutils.onSpriteUpdateInterval(_ball, 20, function (sprite) {
        spriteutils.setVelocityAtAngle(sprite, spriteutils.angleFrom(sprite, _reciever) + 0.4, Math.min(100, 90 + Math.max(0, spriteutils.distanceBetween(sprite, _reciever)) / 100 * 10))
        spriteutils.setVelocityAtAngle(ballShadow, spriteutils.angleFrom(ballShadow, _reciever), Math.min(100, 90 + Math.max(0, spriteutils.distanceBetween(ballShadow, _reciever)) / 100 * 10))
        if (_reciever) {
            if (sprite.overlapsWith(_reciever)) {
                if (!(intercepted)) {
                    if (spriteutils.getSpritesWithin(SpriteKind.Defense, 4, _reciever).length == 0) {
                        CameraX = _reciever.x
                        sprite.setFlag(SpriteFlag.Invisible, true)
                        ballShadow.setFlag(SpriteFlag.Invisible, true)
                        _reciever.setVelocity(sprites.readDataNumber(_reciever, "velocity"), 0)
                        recieverHasPossesion = true
                        if (_reciever.kind() == SpriteKind.PlayerThatCaught) {
                            enableRecieverMovement = true
                            playerPopUp("Caught!", _reciever)
                        }
                        _reciever.setKind(SpriteKind.PlayerWithPossession)
                        for (let value10 of sprites.allOfKind(SpriteKind.Defense)) {
                            value10.follow(_reciever, spriteutils.speed(_reciever) / 1.1)
                        }
                        for (let value11 of sprites.allOfKind(SpriteKind.Player)) {
                            value11.follow(_reciever, spriteutils.speed(_reciever) / 1.3)
                        }
                        return
                    }
                }
            } else {
                if (!(intercepted)) {
                    CameraX = _ball.x
                    return
                }
            }
        }
    })
}
function playerPopUp (text: string, sprite: Sprite) {
    sprites.destroyAllSpritesOfKind(SpriteKind.PlayerPopup)
    popup = fancyText.create(text, 0, 15, fancyText.smallArcade)
    popup.setKind(SpriteKind.PlayerPopup)
    timer.background(function () {
        for (let index3 = 0; index3 <= 15; index3++) {
            popup.setPosition(sprite.x, sprite.y - index3)
            pause(50)
        }
        for (let index4 = 0; index4 <= 15; index4++) {
            fancyText.setText(popup, fancyText.getText(popup).substr(0, text.length - index4))
            pause(50)
        }
    })
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Endzone, function (sprite, otherSprite) {
    timer.background(function () {
        pauseUntil(() => sprite.x <= otherSprite.x - 192 + 16)
        animation.stopAnimation(animation.AnimationTypes.All, sprite)
        sprite.setImage(flip(assets.image`myImage10`))
    })
})
function flip (myImage: Image) {
    img2 = myImage
    myImage.flipX()
    return myImage
}
function set_splash_to (text: string, bool: boolean, cameraX: number) {
    pauseUntil(() => !(controller.anyButton.isPressed()))
    CameraX = cameraX
    gameSplash = fancyText.create(text)
    if (bool) {
        fancyText.setFont(gameSplash, fancyText.italic_small)
    } else {
        fancyText.setFont(gameSplash, fancyText.defaultArcade)
    }
    music.play(music.createSoundEffect(WaveShape.Square, 2000, 2000, 255, 255, 10, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    fancyText.setFrame(gameSplash, assets.image`myImage13`)
    fancyText.setMaxWidth(gameSplash, 120)
    gameSplash.z = 1e+40
    gameSplash.setFlag(SpriteFlag.RelativeToCamera, true)
    gameSplash.setPosition(80, 60)
    pauseUntil(() => controller.anyButton.isPressed())
    sprites.destroy(gameSplash)
    return
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (modes.getCurrentMode() == "preSnap") {
        modes.setMode("onPlay")
    }
})
function x_to_yards (x: number) {
    return Math.floor((x + 79) * 0.31578947368)
}
function set_defensive_colors () {
    for (let value15 of sprites.allOfKind(SpriteKind.Defense)) {
        let mainColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor == "number") {
            if (Teams.containsColors(value15.image)) {
                value15.image.replace(9, mainColor)
                value15.image.replace(3, secondaryColor)
                value15.image.replace(7, sockColor)
            }
        }
    }
    for (let value15 of sprites.allOfKind(SpriteKind.DefenderTackling)) {
        let mainColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor == "number") {
            if (Teams.containsColors(value15.image)) {
                value15.image.replace(9, mainColor)
                value15.image.replace(3, secondaryColor)
                value15.image.replace(7, sockColor)
            }
        }
    }
    for (let value15 of sprites.allOfKind(SpriteKind.DefenderThatTackled)) {
        let mainColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor = Teams.getTeamProperty(opponentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor == "number") {
            if (Teams.containsColors(value15.image)) {
                value15.image.replace(9, mainColor)
                value15.image.replace(3, secondaryColor)
                value15.image.replace(7, sockColor)
            }
        }
    }
}
// Adjust this value to control the lerp speed
function lerpCameraX (targetX: number) {
    // Calculate the new camera X position based on lerpSpeed
    scene.centerCameraAt(scene.cameraProperty(CameraProperty.X) + (targetX - scene.cameraProperty(CameraProperty.X)) * lerpSpeed, 60)
}
// Helper function to generate random yardage within a range
function randomYardage (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (modes.getCurrentMode() == "onPlay") {
        if (_reciever) {
            if (recieverHasPossesion) {
                if (enableRecieverMovement) {
                	
                }
            }
        } else {
            if (!(recieverHasPossesion)) {
                music.play(music.createSoundEffect(WaveShape.Noise, 701, 1, 71, 255, 50, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
                throw_ball_fromto(_qb, running_back)
                timer.background(function () {
                    pauseUntil(() => enableRecieverMovement)
                    music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 239, 186, 255, 10, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    animation.runImageAnimation(
                    _reciever,
                    assets.animation`myAnim`,
                    200,
                    true
                    )
                })
            }
        }
    }
})
sprites.onOverlap(SpriteKind.PlayerWithPossession, SpriteKind.DefenderTackling, function (sprite, otherSprite) {
    timer.after(200, function () {
        if (sprite.overlapsWith(otherSprite)) {
            sprite.setKind(SpriteKind.Player)
            otherSprite.setKind(SpriteKind.DefenderThatTackled)
            recieverHasPossesion = false
            enableRecieverMovement = false
            animation.stopAnimation(animation.AnimationTypes.All, sprite)
            animation.runImageAnimation(
            sprite,
            assets.animation`dive1`,
            300,
            false
            )
            sprite.setVelocity(0, 0)
            sprites.setDataNumber(sprite, "velocity", 0)
            sprites.setDataNumber(sprite, "xvelocity", 0)
            playerPopUp("" + Math.floor(CurrentScrimYardage - x_to_yards(sprite.x)) + "y", sprite)
            timer.after(2600, function () {
                sprites.destroy(otherSprite)
                endPlay(false)
            })
        }
    })
})
function easeSpriteToTarget (sprite: Sprite, target: Sprite) {
    dx = target.x - sprite.x
    dy = target.y - sprite.y
    angle = Math.atan2(dy, dx)
    speed = 2
    easing = 3.14159265359 * ((sprite.x - target.x) / (2 * target.x))
    sprite.x += Math.cos(angle) * (speed * easing)
    sprite.y += Math.sin(angle) * (speed * easing)
}
controller.right.onEvent(ControllerButtonEvent.Released, function () {
    if (modes.getCurrentMode() == "onPlay") {
        if (_reciever) {
            if (recieverHasPossesion) {
                if (enableRecieverMovement) {
                    _reciever.vx = sprites.readDataNumber(_reciever, "velocity")
                }
            }
        }
    }
})
// Simulate a single play
function simulatePlay () {
    // Skip if possession already ended
    if (possessionEnded) {
        return ""
    }
    const randomAction = Math.random();
if (willScore) {
        // Guaranteed to score
        if (!(passCompleted)) {
            yardage = randomYardage(30, 50)
            playLog.push("" + opponentYardage + " - It's a risky pass")
            addDramaticPause()
            playLog.push("The pass is caught!")
            opponentYardage += yardage
            passCompleted = true
            if (opponentYardage >= 100) {
                playLog.push("" + opponentTeam + " drives down the field...")
                playLog.push("TOUCHDOWN!")
                possessionEnded = true
                return "TOUCHDOWN!"
            }
            return "" + opponentTeam + " pass caught."
        } else {
            yardage2 = randomYardage(10, 40)
            playLog.push("" + opponentYardage + " - " + CurrentTeam + " surges forward!")
            addDramaticPause()
            playLog.push("" + opponentTeam + " misses the tackle!")
            opponentYardage += yardage2
            if (opponentYardage >= 100) {
                playLog.push("" + CurrentTeam + " drives down the field...")
                playLog.push("TOUCHDOWN!")
                possessionEnded = true
                return "TOUCHDOWN!"
            }
            return "" + opponentTeam + " offense surges forward."
        }
    } else {
        if (!(passCompleted)) {
            if (randomAction < interceptionOdds) {
                playLog.push("" + opponentYardage + " - It's a short pass")
                addDramaticPause()
                playLog.push("It's intercepted!")
                possessionEnded = true
                return "Possession ended by interception."
            } else if (randomAction < interceptionOdds + fumbleOdds) {
                playLog.push("" + opponentYardage + " - It's a fumble!")
                addDramaticPause()
                playLog.push("" + opponentTeam + " recovers it!")
                possessionEnded = true
                return "Possession ended by fumble."
            } else {
                yardage3 = randomYardage(10, 20)
                playLog.push("" + opponentYardage + " - It's a short pass")
                addDramaticPause()
                playLog.push("The pass is caught!")
                opponentYardage += yardage3
                passCompleted = true
                return "[OFF] pass caught."
            }
        } else {
            if (randomAction < 0.5) {
                playLog.push("" + opponentYardage + " - " + opponentTeam + " goes for the tackle")
                addDramaticPause()
                playLog.push("A strong defensive stop!")
                possessionEnded = true
                return "" + CurrentTeam + " strong tackle."
            } else {
                playLog.push("" + opponentYardage + " - " + CurrentTeam + " go for it on 4th down")
                addDramaticPause()
                playLog.push("" + CurrentTeam + " turn it over.")
                possessionEnded = true
                return "Turnover on downs."
            }
        }
    }
}
function yards_to_x (yards: number) {
    return Math.ceil(yards / 0.31578947368 - 79)
}
function draw_lines_at (scrimmagex: number, firstdownx: number) {
    OriginalField = assets.image`gridiron`
    _field.setImage(OriginalField)
    _field.image.drawLine(scrimmagex + 79, 0, scrimmagex + 79, 99, 8)
    _field.image.drawLine(firstdownx + 79, 0, firstdownx + 79, 99, 5)
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (modes.getCurrentMode() == "onPlay") {
        if (_reciever) {
            if (recieverHasPossesion) {
                if (enableRecieverMovement) {
                    sprites.setDataNumber(_reciever, "velocity", _reciever.vx)
                    _reciever.vx = 0
                }
            }
        } else {
            if (!(recieverHasPossesion)) {
                music.play(music.createSoundEffect(WaveShape.Noise, 701, 1, 71, 255, 50, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
                throw_ball_fromto(_qb, tight_end)
                timer.background(function () {
                    pauseUntil(() => enableRecieverMovement)
                    music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 239, 186, 255, 10, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    animation.runImageAnimation(
                    _reciever,
                    assets.animation`myAnim`,
                    200,
                    true
                    )
                })
            }
        }
    }
})
modes.whenModeChanged("onPlay", function (value) {
    fancyText.setText(ContextText, "")
    soundfx.hut()
    music.play(music.createSoundEffect(WaveShape.Noise, 1, 386, 71, 255, 100, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    _qb.sayText("HUT!", 1000, false)
    _qb.setImage(assets.image`myImage0`)
    spriteutils.moveTo(_qb, spriteutils.pos(_qb.x + 7, _qb.y), 375)
    wr1.setVelocity(-20, 0)
    wr2.setVelocity(-24, 0)
    running_back.setVelocity(-19, 0)
    tight_end.setVelocity(-19, 0)
    sprites.setDataNumber(wr1, "velocity", wr1.vx)
    sprites.setDataNumber(wr2, "velocity", wr2.vx)
    sprites.setDataNumber(running_back, "velocity", running_back.vx)
    sprites.setDataNumber(tight_end, "velocity", tight_end.vx)
    call_play(_play)
    upInd = sprites.create(assets.image`myImage6`, SpriteKind.Indicator)
    upInd.follow(wr1, 99)
    upInd.setPosition(wr1.x, wr1.y)
    sprites.setDataSprite(wr1, "ind", upInd)
    downInd = sprites.create(assets.image`myImage7`, SpriteKind.Indicator)
    downInd.follow(wr2, 99)
    downInd.setPosition(wr2.x, wr2.y)
    sprites.setDataSprite(wr2, "ind", downInd)
    leftInd = sprites.create(assets.image`myImage4`, SpriteKind.Indicator)
    leftInd.follow(running_back, 99)
    leftInd.setPosition(running_back.x, running_back.y)
    sprites.setDataSprite(running_back, "ind", leftInd)
    rightInd = sprites.create(assets.image`myImage5`, SpriteKind.Indicator)
    rightInd.follow(tight_end, 99)
    rightInd.setPosition(tight_end.x, tight_end.y)
    sprites.setDataSprite(tight_end, "ind", rightInd)
    animation.runImageAnimation(
    wr1,
    assets.animation`myAnim0`,
    200,
    true
    )
    animation.runImageAnimation(
    wr2,
    assets.animation`myAnim0`,
    200,
    true
    )
    animation.runImageAnimation(
    cb1,
    assets.animation`myAnim4`,
    200,
    true
    )
    animation.runImageAnimation(
    cb2,
    assets.animation`myAnim4`,
    200,
    true
    )
    for (let sprite of sprites.allOfKind(SpriteKind.Defense)) {
        for (let value9 of sprites.allOfKind(SpriteKind.Player)) {
            if (sprites.readDataNumber(value9, "num") == sprites.readDataNumber(sprite, "num")) {
                if (sprites.readDataNumber(sprite, "num") <= 4) {
                    animation.runImageAnimation(
                    sprite,
                    assets.animation`myAnim3`,
                    200,
                    true
                    )
                    sprite.follow(_qb, 10 / 1.3)
                    value9.follow(sprite, 10 / 1.1)
                } else {
                    sprite.follow(value9, spriteutils.speed(value9) / 1.1)
                    if (value9 == running_back) {
                        sprite.follow(value9, spriteutils.speed(value9) / 2)
                        timer.after(2750, function () {
                            sprite.follow(value9, spriteutils.speed(value9) / 1.1)
                        })
                    }
                }
            }
        }
    }
})
function call_play (playNumber: number) {
    if (playNumber == 0) {
        run_route([[0, 1.2], [1550, 0]], running_back)
        run_route([[0, 0], [1925, -0.5]], wr1)
        run_route([[0, -1], [1250, 0]], tight_end)
    } else if (playNumber == 2) {
        run_route([[0, 0], [2450, -1.6]], wr1)
        run_route([[0, 0], [1925, 0.6]], wr2)
        run_route([[0, -0.6], [650, 0]], running_back)
        run_route([[300, 99]], tight_end)
    }
}
function inGameAlert (text: string) {
    fancyText.setText(ContextText, text)
    sprites.destroyAllSpritesOfKind(SpriteKind.alertGlare)
    alertTextGlare = sprites.create(assets.image`myImage16`, SpriteKind.alertGlare)
    alertTextGlare.setPosition(81, 115)
    alertTextGlare.setFlag(SpriteFlag.RelativeToCamera, true)
    alertTextGlare.z = alertTextGlare.z + 1
    music.play(music.createSoundEffect(WaveShape.Square, 356, 1, 200, 0, 50, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    music.play(music.createSoundEffect(WaveShape.Square, 1109, 1, 255, 0, 300, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    calculatedTextPixelLength = 0
    for (let index5 = 0; index5 <= text.length; index5++) {
        if (text.charAt(index5) != " ") {
            calculatedTextPixelLength += 6
        } else {
            calculatedTextPixelLength += 9
        }
    }
    spriteutils.moveTo(alertTextGlare, spriteutils.pos(80 + calculatedTextPixelLength, 115), 500)
    timer.after(500, function () {
        sprites.destroy(alertTextGlare)
    })
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (modes.getCurrentMode() == "onPlay") {
        if (_reciever == spriteutils.nullConsts(spriteutils.NullConsts.Null)) {
            if (!(recieverHasPossesion)) {
                music.play(music.createSoundEffect(WaveShape.Noise, 701, 1, 71, 255, 50, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
                throw_ball_fromto(_qb, wr2)
                timer.background(function () {
                    pauseUntil(() => enableRecieverMovement)
                    music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 239, 186, 255, 10, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    animation.runImageAnimation(
                    _reciever,
                    assets.animation`myAnim`,
                    200,
                    true
                    )
                })
            }
        }
        if (enableRecieverMovement) {
            _reciever.vx = sprites.readDataNumber(_reciever, "velocity") + 80
            for (let index = 0; index < 5; index++) {
                _reciever.y += 1
                pause(10)
            }
            _reciever.vx = sprites.readDataNumber(_reciever, "velocity")
        }
    }
})
function set_offensive_colors () {
    for (let value22 of sprites.allOfKind(SpriteKind.Player)) {
        let mainColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor2 == "number") {
            if (Teams.containsColors(value22.image)) {
                value22.image.replace(9, mainColor2)
                value22.image.replace(3, secondaryColor2)
                value22.image.replace(7, sockColor2)
            }
        }
    }
    for (let value22 of sprites.allOfKind(SpriteKind.PlayerWithPossession)) {
        let mainColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor2 == "number") {
            if (Teams.containsColors(value22.image)) {
                value22.image.replace(9, mainColor2)
                value22.image.replace(3, secondaryColor2)
                value22.image.replace(7, sockColor2)
            }
        }
    }
    for (let value22 of sprites.allOfKind(SpriteKind.PlayerInEndzone)) {
        let mainColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor2 == "number") {
            if (Teams.containsColors(value22.image)) {
                value22.image.replace(9, mainColor2)
                value22.image.replace(3, secondaryColor2)
                value22.image.replace(7, sockColor2)
            }
        }
    }
    for (let value22 of sprites.allOfKind(SpriteKind.NonPlayerPlayers)) {
        let mainColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.MainColor) as number
let secondaryColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SecondaryColor) as number
let sockColor2 = Teams.getTeamProperty(CurrentTeam, Teams.TeamProperty.SockColor) as number
if (typeof mainColor2 == "number") {
            if (Teams.containsColors(value22.image)) {
                value22.image.replace(9, mainColor2)
                value22.image.replace(3, secondaryColor2)
                value22.image.replace(7, sockColor2)
            }
        }
    }
}
modes.whenModeChanged("defense", function (value) {
	
})
spriteutils.onSpriteKindUpdateInterval(SpriteKind.Defense, 100, function (sprite) {
    if (modes.getCurrentMode() == "onPlay") {
        if (!(intercepted)) {
            if (spriteutils.distanceBetween(_reciever, sprite) <= 9) {
                if (recieverHasPossesion) {
                    sprite.setKind(SpriteKind.DefenderTackling)
                    animation.runImageAnimation(
                    sprite,
                    assets.animation`dive0`,
                    100,
                    false
                    )
                    timer.after(400, function () {
                        sprite.follow(_reciever, 0)
                        sprite.setVelocity(0, 0)
                    })
                }
            }
            if (spriteutils.distanceBetween(_qb, sprite) <= 5) {
                if (!(recieverHasPossesion)) {
                    sprite.setKind(SpriteKind.DefenderTackling)
                    animation.runImageAnimation(
                    sprite,
                    assets.animation`dive2`,
                    100,
                    false
                    )
                    timer.after(400, function () {
                        sprite.follow(_reciever, 0)
                        sprite.setVelocity(0, 0)
                    })
                }
            }
        }
    }
})
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    playNames = ["Vertical Stretch", "Four Verticals", "Cross Mesh"]
    if (playFormationLines) {
        if (_play != playFormationImagesArray.length - 1) {
            _play += 1
        } else {
            _play = 0
        }
        playFormationLines.setImage(playFormationImagesArray[_play])
    }
    inGameAlert(playNames[_play])
})
function generate_OL () {
    playerInt = 0
    _qb = sprites.create(assets.image`myImage3`, SpriteKind.Player)
    _qb.setPosition(yards_to_x(CurrentScrimYardage) + 13, 60)
    for (let index7 = 0; index7 <= 4; index7++) {
        if (index7 == 2) {
            center = sprites.create(flip(assets.image`myImage2`), SpriteKind.Player)
            center.setPosition(_qb.x - 10, 60 - 18 + 6 * (index7 + 1))
            sprites.setDataNumber(center, "num", playerInt)
        } else {
            safety = sprites.create(flip(assets.image`myImage2`), SpriteKind.Player)
            safety.setPosition(_qb.x - 8, 60 - 18 + 6 * (index7 + 1))
            sprites.setDataNumber(safety, "num", playerInt)
        }
        playerInt += 1
    }
    wr1 = sprites.create(assets.image`myImage3`, SpriteKind.Player)
    wr1.setPosition(_qb.x - 2, 27)
    sprites.setDataNumber(wr1, "num", playerInt)
    playerInt += 1
    wr2 = sprites.create(assets.image`myImage3`, SpriteKind.Player)
    wr2.setPosition(_qb.x - 2, 90)
    sprites.setDataNumber(wr2, "num", playerInt)
    sprites.setDataNumber(wr1, "xvelocity", -20)
    sprites.setDataNumber(wr2, "xvelocity", -24)
    playerInt += 1
    running_back = sprites.create(assets.image`myImage3`, SpriteKind.Player)
    running_back.setPosition(_qb.x + 20, _qb.y)
    sprites.setDataNumber(running_back, "num", playerInt)
    playerInt += 1
    tight_end = sprites.create(assets.image`myImage3`, SpriteKind.Player)
    tight_end.setPosition(_qb.x - 8, 80)
    sprites.setDataNumber(tight_end, "num", playerInt)
    playerInt += 1
}
function run_route (directions: number[][], offensive_player: Sprite) {
    timer.background(function () {
        for (let value7 of directions) {
            pause(value7[0])
            if (value7[1] != 99) {
                spriteutils.setVelocityAtAngle(offensive_player, value7[1], sprites.readDataNumber(offensive_player, "velocity"))
            } else {
                offensive_player.setVelocity(0, 0)
            }
        }
    })
}
sprites.onOverlap(SpriteKind.PlayerWithPossession, SpriteKind.Endzone, function (sprite, otherSprite) {
    sprites.destroy(_ball)
    sprite.setKind(SpriteKind.NonPlayerPlayers)
    otherSprite.setKind(SpriteKind.NonPlayerPlayers)
    if (CurrentTeam == CurrentAwayTeam) {
        AwayScore += 6
    } else {
        HomeScore += 6
    }
    enableRecieverMovement = false
    endPlay(true)
    timer.after(3000, function () {
        end_possession(true)
    })
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.DefenderTackling, function (sprite, otherSprite) {
    if (modes.getCurrentMode() == "onPlay") {
        if (sprite == _qb) {
            if (!(recieverHasPossesion)) {
                if (!(_reciever)) {
                    CameraX = sprite.x
                    sprite.setKind(SpriteKind.SackedQB)
                    sprites.destroyAllSpritesOfKind(SpriteKind.Indicator)
                    otherSprite.setKind(SpriteKind.DefenderThatTackled)
                    animation.stopAnimation(animation.AnimationTypes.All, sprite)
                    animation.runImageAnimation(
                    sprite,
                    assets.animation`dive1`,
                    300,
                    false
                    )
                    sprite.setVelocity(0, 0)
                    sprites.setDataNumber(sprite, "velocity", 0)
                    sprites.setDataNumber(sprite, "xvelocity", 0)
                    playerPopUp("" + Math.floor(CurrentScrimYardage - x_to_yards(sprite.x)) + "y", sprite)
                    if (!(recieverHasPossesion)) {
                        modes.addMode("sack")
                        modes.setMode("sack", otherSprite)
                    }
                }
            }
        }
    }
})
function simulatePossession () {
    possessionEnded = false
    passCompleted = false
    successfulPlays = 0
    startingYardage = opponentYardage
    playLog.push("" + opponentTeam + " get the ball")
    console.log("" + opponentTeam + " get the ball")
    for (let index = 0; index < 3; index++) {
        if (possessionEnded) {
            break;
        }
        playResult = simulatePlay()
        if (playResult) {
            console.log(`${opponentYardage} - ${playResult}`)
        }
    }
    if (!(possessionEnded)) {
        if (opponentYardage >= 100) {
            playLog.push("TOUCHDOWN!")
            console.log("TOUCHDOWN!")
        } else if (opponentYardage - startingYardage < 10) {
            playLog.push(`${opponentYardage} - ${opponentTeam} fails to convert on 3rd down`)
            playLog.push("Possession ends with a punt.")
            console.log(`${opponentYardage} - ${opponentTeam} fails to convert on 3rd down`)
            console.log("Possession ends with a punt.")
        } else {
            playLog.push("TURNOVER ON DOWNS!")
            console.log("TURNOVER ON DOWNS!")
        }
    }
}
function addDramaticPause () {
    console.log("...")
    playLog.push("...")
}
let startingYardage = 0
let successfulPlays = 0
let safety: Sprite = null
let center: Sprite = null
let playNames: string[] = []
let calculatedTextPixelLength = 0
let alertTextGlare: Sprite = null
let rightInd: Sprite = null
let leftInd: Sprite = null
let downInd: Sprite = null
let upInd: Sprite = null
let tight_end: Sprite = null
let OriginalField: Image = null
let yardage3 = 0
let yardage2 = 0
let yardage = 0
let passCompleted = false
let possessionEnded = false
let easing = 0
let speed = 0
let angle = 0
let dy = 0
let dx = 0
let gameSplash: fancyText.TextSprite = null
let img2: Image = null
let popup: fancyText.TextSprite = null
let ballShadow: Sprite = null
let mainDefenseSplash = ""
let cutsceneYardage = 0
let playLog: string[] = []
let olb2: Sprite = null
let olb1: Sprite = null
let wr2: Sprite = null
let cb2: Sprite = null
let wr1: Sprite = null
let cb1: Sprite = null
let defensive_tackle_end: Sprite = null
let linebacker: Sprite = null
let playerInt = 0
let _ball: Sprite = null
let _reciever: Sprite = null
let _qb: Sprite = null
let running_back: Sprite = null
let playFormationLines: Sprite = null
let intercepted = false
let recieverHasPossesion = false
let enableRecieverMovement = false
let onField = false
let CurrentDown = 0
let CurrentDownYardage = 0
let CurrentFirstDownLineYardage = 0
let CurrentScrimYardage = 0
let ContextText: fancyText.TextSprite = null
let HomeScore = 0
let AwayScore = 0
let Downs: fancyText.TextSprite = null
let _endzones: Sprite = null
let _field: Sprite = null
let CameraX = 0
let lerpSpeed = 0
let playFormationImagesArray: Image[] = []
let _play = 0
let CurrentHomeTeam: Teams.TeamEnum = null
let CurrentAwayTeam: Teams.TeamEnum = null
let endingplay = false
let willScore = false
let fumbleOdds = 0
let interceptionOdds = 0
let opponentTeam: Teams.TeamEnum = null
let CurrentTeam = 0
let playResult = ""
let opponentYardage = 0
let chanceOfScoring = 0
opponentYardage = 25
interceptionOdds = 0.15
fumbleOdds = 0.15
willScore = Math.percentChance(50)
modes.addMode("preSnap")
modes.addMode("onPlay")
endingplay = false
CurrentAwayTeam = Teams.getTeamFromEnum(Teams.TeamEnum.PHI)
CurrentHomeTeam = Teams.getTeamFromEnum(Teams.TeamEnum.KC)
CurrentTeam = CurrentHomeTeam
_play = 0
playFormationImagesArray = [assets.image`play1`, img`
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ...5......................................................................................
    ..55......................................................................................
    .555555555555555555555555555555555555555555555555555555555555555555.......................
    5555555555555555555555555555555555555555555555555555555555555555555.......................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    .............................................................................8............
    ............................................................................88............
    ...........................................................................88888888888888.
    ..........................................................................888888888888888.
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ....................8.....................................................................
    ...................88.....................................................................
    ..................8888888888888888888888888888888888888888888888..........................
    .................88888888888888888888888888888888888888888888888..........................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ...5......................................................................................
    ..55......................................................................................
    .555555555555555555555555555555555555555555555555555555555555555555.......................
    5555555555555555555555555555555555555555555555555555555555555555555.......................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    `, img`
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    .................55555555555555555555555555555555555555555555555555.......................
    .................55555555555555555555555555555555555555555555555555.......................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................55.......................................................................
    .................5555.....................................................................
    .................555......................................................................
    .................55.......................................................................
    .................5........................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ........................................................................................8.
    ........................................................................................8.
    .......................................................................................88.
    .......................................................................................88.
    ......................................................................................888.
    ......................................................................................888.
    .....................................................................................888..
    .....................................................................................888..
    ....................................................................................888...
    ....................................................................................888...
    ....................................8..............................................888....
    ...................................88..............................................888....
    ..................................888888888888888888888888888888888888888888888888888.....
    .................................8888888888888888888888888888888888888888888888888888.....
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ......5555................................................................................
    ......555.................................................................................
    ......5555................................................................................
    ......5.555...............................................................................
    .........555..............................................................................
    ..........555.......................................11....................................
    ...........555......................................11....................................
    ............555.....................................111111111111..........................
    .............555....................................111111111111..........................
    ..............555...................................11....................................
    ...............555..................................11....................................
    ................555.......................................................................
    .................555......................................................................
    ..................555.....................................................................
    ...................555....................................................................
    ....................555...................................................................
    .....................555..................................................................
    ......................555555555555555555555555555555555555555555555.......................
    .......................55555555555555555555555555555555555555555555.......................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    ..........................................................................................
    `]
lerpSpeed = 0.1
CameraX = 80
_field = sprites.create(assets.image`gridiron`, SpriteKind.Field)
_endzones = sprites.create(assets.image`endzones`, SpriteKind.Endzone)
_field.z = -50
_endzones.z = -49
Downs = fancyText.create("         ")
let Score = fancyText.create("" + Teams.getTeamProperty(CurrentAwayTeam, Teams.TeamProperty.TeamAbbreviation) + " " + AwayScore + "-" + HomeScore + " " + Teams.getTeamProperty(CurrentHomeTeam, Teams.TeamProperty.TeamAbbreviation))
ContextText = fancyText.create("")
fancyText.setFont(Downs, fancyText.smallArcade)
Downs.setPosition(129, 5)
Score.setPosition(41, 5)
ContextText.setPosition(7, 111)
Downs.setFlag(SpriteFlag.RelativeToCamera, true)
Score.setFlag(SpriteFlag.RelativeToCamera, true)
ContextText.setFlag(SpriteFlag.RelativeToCamera, true)
CurrentScrimYardage = 75.25
CurrentFirstDownLineYardage = CurrentScrimYardage - 30
CurrentDownYardage = CurrentScrimYardage - CurrentFirstDownLineYardage
CurrentDown = 3
timer.background(function () {
    while (!(onField)) {
        lerpCameraX(CameraX)
        pause(10)
    }
})
enableRecieverMovement = false
recieverHasPossesion = false
if (CurrentTeam == CurrentHomeTeam) {
    opponentTeam = CurrentAwayTeam
} else {
    opponentTeam = CurrentHomeTeam
}
set_splash_to("Kansas City vs\\n Philadelphia", true, yards_to_x(50))
music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 556, 400, 400, 10, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
set_splash_to("Philadelphia punts", false, 0)
set_splash_to("Kansas City returns...", false, 190)
set_splash_to("to the 25 yard line.", false, 140)
onField = true
modes.setMode("preSnap", yards_to_x(CurrentScrimYardage))
intercepted = false
game.onUpdate(function () {
    if (Score) {
        fancyText.setText(Score, "" + Teams.getTeamProperty(CurrentAwayTeam, Teams.TeamProperty.TeamAbbreviation) + " " + AwayScore + "-" + HomeScore + " " + Teams.getTeamProperty(CurrentHomeTeam, Teams.TeamProperty.TeamAbbreviation))
    }
})
game.onUpdate(function () {
    if (!(onField)) {
        for (let value12 of sprites.allOfKind(SpriteKind.NonPlayerPlayers)) {
            value12.setFlag(SpriteFlag.Invisible, true)
        }
    } else {
        for (let value13 of sprites.allOfKind(SpriteKind.NonPlayerPlayers)) {
            value13.setFlag(SpriteFlag.Invisible, false)
        }
    }
})
game.onUpdate(function () {
    lerpCameraX(CameraX)
})
game.onUpdate(function () {
    set_offensive_colors()
    set_defensive_colors()
})
