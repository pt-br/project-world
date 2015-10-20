var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Wiki = require('wikijs');

app.use("/css", express.static(__dirname + '/css'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/images", express.static(__dirname + '/images'));
app.use('/favicon.ico', express.static('favicon.ico'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var wiki = new Wiki();

// Testing wikijs module
wiki.random().then(function(title) {
  var randomTitle = title[0];
  console.log(title[0]);
  wiki.page(randomTitle).then(function(page) {
    page.summary().then(function(content) {
      console.log(content); 
    });
  });
});


io.on('connection', function(socket) {
  console.log("User connected");

  console.log("Load world - New connection");

  var $botInfo = [];

  $botList.forEach(function(index, value) {
    $botInfo.push($botList[value].information);
  });

  socket.emit("load_world", $botInfo, $$world.dayTimeClass);
  
  socket.on('walk', function(top, left) {
    //console.log("top: " + top);
    //console.log("left: " + left);
  });

  socket.on('end_walk', function() {
    checkProximity();
  });

  socket.on('disconnect', function() {
    console.log("User disconnected");
  });

});

var port = process.env.PORT || 3000;

http.listen(port, function() {
  console.log("Runing server on port: " + port);
});

function loadWords() {
  fs.readFile('lib/words.txt', function(err, data) {
    if(err) throw err;
    var $allText = data.toString();
    $$wordList = $allText.split(/\n/);
  });
}

function Bot($botName, $gender, $parent1, $parent2) {
  var $this = this;
  $this.name = $botName;
  $this.live = true;
  $this.gender = $gender;
  $this.thinkTime;
  $this.busy = false;
  $this.enjoyingConversation = 0;
  $this.top = 200;
  $this.left = 200;
  $this.face;
  $this.friends = [];
  $this.enemies = [];
  $this.nextTo = [];
  $this.parents = [$parent1, $parent2];
  $this.id = $botList.length;
  $this.information = [];

  request('http://api.randomuser.me/?gender='+$gender, function (error, response, data) {
  if (!error && response.statusCode == 200) {
      jsonObject = JSON.parse(data);
      $this.face = jsonObject.results[0].user.picture.thumbnail;
      $this.information = [$this.name, $this.gender, $this.face, $this.top, $this.left, $this.id];
    }
  });


  $botList.push($this);
  $$world.setBotThinkTime($this);

  console.warn("[ World Info ] TimeThink of " + $this.name + " on his creation: " + $this.getThinkTime());

  var $lifeCicle = setInterval(function() {
    if($this.live == true) {
      $this.think();
    }
    else {
      clearInterval($lifeCicle);
      console.log("[DEATH]: "+ $this.getName());
    }
  }, $this.thinkTime);
}

function World($worldName) {
  this.name = $worldName;
  this.dayTime;
  this.dayTimeClass;
  this.hour;
}

World.prototype.setDayTime = function() {
  var $date = new Date();
  var $hour = $date.getHours();
  $hour < 10 ? this.hour = "0" + $hour : this.hour = $hour;
  if($hour > 19 || $hour < 5) {
    this.dayTime = "night";
    this.dayTimeClass =  "timeNight";
  } else {
    this.dayTime = "day";
    this.dayTimeClass =  "timeDay";
  }
}

World.prototype.getDayTime = function() {
  return this.dayTime;
}

World.prototype.getHour = function() {
  return this.hour;
}

World.prototype.setBotThinkTime = function($$botObject) {
  var $newThinkTime = Math.floor((Math.random() * 5000) + 2000);
  $$botObject.thinkTime = $newThinkTime;
}

/// Bot Functions ///
Bot.prototype.getName = function() {
  return this.name;
}
Bot.prototype.setThinkTime = function($manualThinkTime) {
  //this.thinkTime = $manualThinkTime;
  this.thinkTime = Math.floor((Math.random() * 5000) + $manualThinkTime);
}
Bot.prototype.getThinkTime = function() {
  return this.thinkTime;
}
Bot.prototype.doNothing = function() {
  console.log("[ " + this.getName() + " ] I'm bored. I don't wanna do nothing now...");
  io.emit("think", this.id, "I'm bored. I don't wanna do nothing now...");
}
Bot.prototype.walk = function() {
  var $this = this;
  console.log("[ " + $this.getName() + " ] I'd like to take a walk!");
  io.emit("think", $this.id, "I'd like to take a walk!");

  cleanProximity($this);

  var $worldHeight = 1024 - 20;
  var $worldWidth = 780 - 20;
  
  var $moveHeigth = Math.floor(Math.random() * $worldHeight);
  var $moveWidth = Math.floor(Math.random() * $worldWidth);
  
  var $newPosition = [$moveHeigth, $moveWidth]; 

  // Save the cordinates in the bot's object
  $this.top = $moveHeigth;
  $this.left = $moveWidth;

  // Update the bot information - top and left
  $this.information[3] = $this.top;
  $this.information[4] = $this.left;

  io.emit('walk', $moveHeigth, $moveWidth, $this.id); 
}
Bot.prototype.talk = function() {
  var $this = this;
  console.log("[ THINKING ] " + $this.getName() + " thinks: I wanna talk a little, but with who?");
  io.emit("think", $this.id, "I wanna talk a little, but with who?");
  var $nextTotal = $this.nextTo.length;
  var $nextMax = $nextTotal -1;

  if($nextTotal > 0) {
    // Choose one of the next elements to talk to
    var $choosenBotId = Math.floor(Math.random() * $nextMax);
    var $talkingPartner = $this.nextTo[$choosenBotId];
    
    if(!$talkingPartner.busy) {
      // Partner is not busy
      var $relationShip = checkRelationship($this, $talkingPartner);
      if($relationShip == "none" || $relationShip == "friend") {
        // Partnet is not an enemy, start a chat
        $talkingPartner.busy = true;
        console.log("[ " + $this.getName() + " ] Aha! I'll talk to " + $talkingPartner.getName());
        io.emit("think", $this.id, "Aha! I'll talk to " + $talkingPartner.getName());
        var $nextPhraseTime = Math.floor((Math.random() * 5000) + 2000);
        var $talkingNow = 1;
        var $chatInterval = setInterval(function() {
          if($this.enjoyingConversation > -3 && $this.enjoyingConversation < 3 && $talkingPartner.enjoyingConversation > -3 && $talkingPartner.enjoyingConversation < 3) {
            // Keep talking
            var $toSay = say();
            
            if($talkingNow == 1) {

              // Clean the last phrase
              io.emit("clear_last_phrase", $talkingPartner.id);

              console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": " + $toSay);
              io.emit("talk", $this.id, "says to " + $talkingPartner.getName() + ": " + $toSay);
              var $like = Math.floor(Math.random() * 2);
              if($like == 0) {
                // Didn't like 
                console.warn("[ THINKING ] " + $talkingPartner.getName() + " thinks: Hmm... I didn't like this...");
                io.emit("think", $talkingPartner.id, "Hmm... I didn't like this...");
                $talkingPartner.enjoyingConversation--;
              } else {
                // Like
                console.log("[ THINKING ] " + $talkingPartner.getName() + " thinks: Wow! Interesting");
                io.emit("think", $this.id, "Wow! Interesting");
                $talkingPartner.enjoyingConversation++;
              }

              $talkingNow = 2;

            } else {

              // Clean the last phrase
              io.emit("clear_last_phrase", $this.id);

              console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": " + $toSay);
              io.emit("talk", $talkingPartner.id, "says to " + $this.getName() + ": " + $toSay);
              var $like = Math.floor(Math.random() * 2);
              if($like == 0) {
                // Didn't like 
                console.warn("[ THINKING ] " + $this.getName() + " thinks: Hmm... I didn't like this...");
                io.emit("think", $this.id, "Hmm... I didn't like this...");
                $this.enjoyingConversation--;
              } else {
                // Like
                console.log("[ THINKING ] " + $this.getName() + " thinks: Wow! Interesting");
                io.emit("think", $this.id, "Wow! Interesting");
                $this.enjoyingConversation++;
              }

              $talkingNow = 1;
            }
            $nextPhraseTime = Math.floor((Math.random() * 10000) + 5000);
          } else {
            // Stop the talking
            clearInterval($chatInterval);
            $this.busy = false;
            $talkingPartner.busy = false;

            // Define new friends/enemies
            if($this.enjoyingConversation == 3) {
              var $relationShip = checkRelationship($this, $talkingPartner);
              if($relationShip == "none") {
                $this.friends.push($talkingPartner);
                $talkingPartner.friends.push($this);
                console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
                io.emit("talk", $this.id, "says to " + $talkingPartner.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
              }
              else if($relationShip == "friend") {
                console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": It's always good to talk with you, my friend! Goodbye");
                io.emit("talk", $this.id, "says to " + $talkingPartner.getName() + ": It's always good to talk with you, my friend! Goodbye");
              }
            }
            else if($this.enjoyingConversation == -3) {
              var $relationShip = checkRelationship($this, $talkingPartner);
              if($relationShip == "none") {
                $this.enemies.push($talkingPartner);
                $talkingPartner.enemies.push($this);
                console.error("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
                io.emit("final_talk", $this.id, "says to " + $talkingPartner.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
              }
              else if($relationShip == "friend") {
                $this.enemies.push($talkingPartner);
                removeFriend($this, $talkingPartner);
                $talkingPartner.enemies.push($this);
                removeFriend($talkingPartner, $this);
                console.error("[ CONVERSATION ] " + $this.getName() + " says to " + $talkingPartner.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
                io.emit("talk", $this.id, "says to " + $talkingPartner.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
              }
            }
            else if($talkingPartner.enjoyingConversation == 3) {
              var $relationShip = checkRelationship($talkingPartner, $this);
              if($relationShip == "none") {
                $talkingPartner.friends.push($this);
                $this.friends.push($talkingPartner);
                console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
                io.emit("talk", $talkingPartner.id, "says to " + $this.getName() + ": I really liked to talk to you, consider yourself my friend! Goodbye");
              }
              else if($relationShip == "friend") {
                console.log("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": It's always good to talk with you, my friend! Goodbye");
                io.emit("talk", $talkingPartner.id, "says to " + $this.getName() + ": It's always good to talk with you, my friend! Goodbye");
              }
            }
            else if($talkingPartner.enjoyingConversation == -3) {
              var $relationShip = checkRelationship($talkingPartner, $this);
              if($relationShip == "none") {
                $talkingPartner.enemies.push($this);
                $this.enemies.push($talkingPartner);
                console.error("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
                io.emit("talk", $talkingPartner.id, "says to " + $this.getName() + ": You are a bullshit! Don't be crazy to get in my way again!");
              }
              else if($relationShip == "friend") {
                $talkingPartner.enemies.push($this);
                removeFriend($talkingPartner, $this);
                $this.enemies.push($talkingPartner);
                removeFriend($this, $talkingPartner);
                console.error("[ CONVERSATION ] " + $talkingPartner.getName() + " says to " + $this.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
                io.emit("talk", $talkingPartner.id, "says to " + $this.getName() + ": I used to be your friend, but after this conversation... NO MORE!");
              }
            }
            // Clean the enjoyingConversation value
            $this.enjoyingConversation = 0;
            $talkingPartner.enjoyingConversation = 0;

            // Clean talk box
            setTimeout(function() {
              io.emit("end_talk", $this.id, $talkingPartner.id);
            }, 6000);
            
          }
        }, $nextPhraseTime);
      } 
      else if ($relationShip == "enemy") {
        console.error("[ THINKING ] " + $this.getName() + " thinks: I don't wanna talk to " + $talkingPartner.getName() + "!");
        io.emit("think", $this.id, "I don't wanna talk to " + $talkingPartner.getName() + "!");
        $this.busy = false;
      }
    } else {
      if($talkingPartner.live == true) {
        // Partner busy, can't talk now
        console.log("[ THINKING ] " + $this.getName() + " thinks: Oh... I would talk with " + $talkingPartner.getName() + " but " + $talkingPartner.getName() + " is busy now :/");
        io.emit("think", $this.id, "Oh... I would talk with " + $talkingPartner.getName() + " but " + $talkingPartner.getName() + " is busy now :/");
        $this.busy = false;
      }
      else {
        // Partner is dead
        console.log("[ " + $this.getName() + " ] Poor " + $talkingPartner.getName() + "... died too young... ");
        io.emit("think", $this.id, "Poor " + $talkingPartner.getName() + "... died too young...");
        $this.busy = false;
      }
    }

  } else {
    // Nobody near
    console.log("[ THINKING ] " + $this.getName() + " thinks: There is nobody near me to talk :/");
    io.emit("think", $this.id, "There is nobody near me to talk :/");
    $this.busy = false;
  }
}
Bot.prototype.haveBaby = function() {
  var $this = this;
  console.log("[ THINKING ] " + $this.getName() + " thinks: Hmm... would be interesting to have a baby...");
  io.emit("think", $this.id, "Hmm... would be interesting to have a baby...");

  var $nextTotal = $this.nextTo.length;
  var $nextMax = $nextTotal -1;
  if($nextTotal > 0) {
    // Choose one of the next elements
    var $choosenBotId = Math.floor(Math.random() * $nextMax);
    var $botPartner = $this.nextTo[$choosenBotId];
    if(!$botPartner.busy) {
      // Partner is not busy
      var $relationShip = checkRelationship($this, $botPartner);
      if($this.gender != $botPartner.gender) {
        // Partner is same gender
        if($relationShip == "friend") {
          // Partner is friend, ask for a baby
          console.log("[ THINKING ] " + $this.getName() + " thinks: I should ask " + $botPartner.getName() + " for a baby... @.@");
          io.emit("think", $this.id, "I should ask " + $botPartner.getName() + " for a baby... @.@");

          $botPartner.busy = true;

          console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $botPartner.getName() + ": Look... We are friends for a long time... Don't you think that we can create a baby? :)");
          io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": Look... We are friends for a long time... Don't you think that we can create a baby? :)");
        
          setTimeout(function() {
            var $decision1 = Math.floor((Math.random() * 6) + 1);

            if($decision1 >= 3) {
              // Proceed to next step for a baby
              io.emit("clear_last_phrase", $this.id);
              console.log("[ CONVERSATION ] " + $botPartner.getName() + " says to " + $this.getName() + ": Hmm... a baby could be nice. Are you sure?");
              io.emit("talk", $botPartner.id, "says to " + $this.getName() + ": Hmm... a baby could be nice. Are you sure?");
              setTimeout(function() {
                // Second step decision
                var $decision2 = Math.floor((Math.random() * 6) + 1);

                if($decision2 >= 3) {
                  // Will have a baby
                  io.emit("clear_last_phrase", $botPartner.id);
                  console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $botPartner.getName() + ": Yes! Im sure, let's have a baby :)");
                  io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": Yes! Im sure, let's have a baby :)");
                  setTimeout(function() {

                    // Have a baby and end haveBaby

                    spawnBaby($this, $botPartner);

                    io.emit("end_talk", $this.id, $botPartner.id);
                    $this.busy = false;
                    $botPartner.busy = false;

                  }, 5000);
                }
                else {
                  // Will not have a baby on step 2
                  io.emit("clear_last_phrase", $botPartner.id);
                  console.log("[ CONVERSATION ] " + $this.getName() + " says to " + $botPartner.getName() + ": Thinking better about this... I'm not ready to have a baby now :/");
                  io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": Thinking better about this... I'm not ready to have a baby now :/");
                  setTimeout(function() {

                    // End haveBaby
                    io.emit("end_talk", $this.id, $botPartner.id);
                    $this.busy = false;
                    $botPartner.busy = false;

                  }, 5000);
                }

              }, 3000);
            }
            else {
              // Will not have a baby on step 1
              io.emit("clear_last_phrase", $this.id);
              console.log("[ CONVERSATION ] " + $botPartner.getName() + " says to " + $this.getName() + ": I don't think that this is a good idea... is too soon to have a baby...");
              io.emit("talk", $botPartner.id, "says to " + $this.getName() + ": I don't think that this is a good idea... is too soon to have a baby...");
              setTimeout(function() {

                // End haveBaby
                io.emit("end_talk", $this.id, $botPartner.id);
                $this.busy = false;
                $botPartner.busy = false;

              }, 5000);
            }
          }, 3000);
        } 
        else {
          // Partner is not friend
          console.log("[ THINKING ] " + $this.getName() + " thinks: I would ask "+ $botPartner.getName() + " for a baby, but we are not friends :(");
          io.emit("think", $this.id, "I would ask "+ $botPartner.getName() + " for a baby, but we are not friends :(");
          $this.busy = false;
        }
      } else {
        // Partner is same gender
        console.log("[ THINKING ] " + $this.getName() + " thinks: I would ask "+ $botPartner.getName() + " for a baby, but we are same gender :(");
        io.emit("think", $this.id, "I would ask "+ $botPartner.getName() + " for a baby, but we are same gender :(");
        $this.busy = false;
      }
    } else {
      // Partner is busy
      console.log("[ THINKING ] " + $this.getName() + " thinks: There is nobody available to have a baby :(");
      io.emit("think", $this.id, "There is nobody available to have a baby :(");
      $this.busy = false;
    }
  }
  else {
    console.log("[ THINKING ] " + $this.getName() + " thinks: There is nobody near me to ask for a baby :(");
    io.emit("think", $this.id, "There is nobody near me to ask for a baby :(");
    $this.busy = false;
  }
}

Bot.prototype.fight = function($bot, $botPartner) {
  var $this = this;
  $this.busy = true;
  $botPartner.busy = true;

  console.log("[ FIGHT ] " + $this.getName() + " says to " + $botPartner.getName() + ": I tried to control myself, but you really are disturbing me, I'll punch you sucker!");
  io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": I tried to control myself, but you really are disturbing me, I'll punch you sucker!");

  setTimeout(function() {
    console.log("[ FIGHT ] " + $botPartner.getName() + " says: Fuck");
    io.emit("talk", $botPartner.id, "says: Fuck");
    io.emit("clear_last_phrase", $this.id);

    setTimeout(function() {
      // Start the fight
      console.log("[ FIGHT ] " + $this.getName() + ": ##%%@@@**&&&@!@@$#%$$$##%$@@!$$@#%)(*)&#%*&%");
      io.emit("talk", $this.id, "##%%@@@**&&&@!@@$#%$$$##%$@@!$$@#%)(*)&#%*&%");

      console.log("[ FIGHT ] " + $botPartner.getName() + ": &&&%@@#!@$!$@#&*&*@&*$!@$!@&*");
      io.emit("talk", $botPartner.id, "&&&%@@#!@$!$@#&*&*@&*$!@$!@&*");

      setTimeout(function() {
        // Step 2 of fight
        console.log("[ FIGHT ] " + $this.getName() + ": &&&*#@@#$!@$(&%%&&*&*%&*@@!!###");
        io.emit("talk", $this.id, "&&&*#@@#$!@$(&%%&&*&*%&*@@!!###");

        console.log("[ FIGHT ] " + $botPartner.getName() + ": @@##@$@%#**&&*!@@$!@$@!&*$@&*!@$&*");
        io.emit("talk", $botPartner.id, "@@##@$@%#**&&*!@@$!@$@!&*$@&*!@$&*");

        setTimeout(function() {
          // Define what will happen - Nothing | Apologize | DEATH
          var $endFight = Math.floor((Math.random() * 100) + 1);
          //var $endFight = 1;
          if($endFight <= 5) {
            // Death

            var $whoWillDie = Math.floor((Math.random() * 2) + 1);

            if($whoWillDie == 1) {
              // Starter of fight will die
              console.log("[ FIGHT ] " + $this.getName() + " says: X.X");
              io.emit("talk", $this.id, "says: X.X");

              console.log("[ FIGHT ] " + $botPartner.getName() + " says to " + $this.getName() + ": Oh fuck! What I've done?!");
              io.emit("talk", $botPartner.id, "says to " + $this.getName() + ": Oh fuck! What I've done?!");

              $this.die();
              
              setTimeout(function() {
                // End fight
                io.emit("clear_last_phrase", $this.id);
                io.emit("clear_last_phrase", $botPartner.id);
                $botPartner.busy = false;

              }, 5000);
            }
            else {
              console.log("[ FIGHT ] " + $this.getName() + " says to " + $botPartner.getName() + ": I should not have taken it so seriously!!!");
              io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": I should not have taken it so seriously!!!");

              console.log("[ FIGHT ] " + $botPartner.getName() + " says: X.X");
              io.emit("talk", $botPartner.id, "says: X.X");

              $botPartner.die();
              
              setTimeout(function() {
                // End fight
                io.emit("clear_last_phrase", $this.id);
                io.emit("clear_last_phrase", $botPartner.id);
                $this.busy = false;

              }, 5000);
            }
          }
          else if($endFight > 5 && $endFight <= 20) {
            // Apologize
            console.log("[ FIGHT ] " + $this.getName() + " says to " + $botPartner.getName() + ": Wow... I'm really sorry... We should not be enemies. Do you forgive me?");
            io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": Wow... I'm really sorry... We should not be enemies. Do you forgive me?");

            console.log("[ FIGHT ] " + $botPartner.getName() + " says to " + $this.getName() + ": You are right. Let's be friends.");
            io.emit("talk", $botPartner.id, "says to " + $this.getName() + ": You are right. Let's be friends.");

            removeEnemy($this, $botPartner);

            $this.friends.push($botPartner);
            $botPartner.friends.push($this);
            
            setTimeout(function() {
              // End fight
              io.emit("end_talk", $this.id, $botPartner.id);
              $this.busy = false;
              $botPartner.busy = false;

            }, 3000);
          }
          else if($endFight > 20) {
            // Nothing
            console.log("[ FIGHT ] " + $this.getName() + " says to " + $botPartner.getName() + ": You are lucky to be alive! Get away from me!");
            io.emit("talk", $this.id, "says to " + $botPartner.getName() + ": You are lucky to be alive! Get away from me!");

            console.log("[ FIGHT ] " + $botPartner.getName() + " says to " + $this.getName() + ": Fuck you...");
            io.emit("talk", $botPartner.id, "says to " + $this.getName() + ": Fuck you...");

            setTimeout(function() {
              // End fight
              io.emit("end_talk", $this.id, $botPartner.id);
              $this.busy = false;
              $botPartner.busy = false;

            }, 3000);

          }


        }, 3000);

      });

    }, 3000);


  }, 3000);
}

Bot.prototype.die = function() {
  var $this = this;
  $this.live = false;
  $this.face = "/images/rip.png";
  // Update bot information
  $this.information[2] = "/images/rip.png";
  $this.information.push("dead");
  io.emit("bot_death", $this.id);
}

Bot.prototype.think = function() {
  var $this = this;
  if(!$this.busy) {
    console.log("[ THINKING ] " + $this.getName() + " thinks: Hm... I'm thinking...");
    var $newDesire = Math.floor((Math.random() * 4) + 1);
    switch($newDesire) {
      case 1: 
        $$world.setBotThinkTime($this);
        $this.doNothing();
        break;
      case 2: 
        $this.setThinkTime(3000);
        $this.walk();
        break;
      case 3: 
        $$world.setBotThinkTime($this);
        $this.busy = true;
        $this.talk();
        break;
      case 4: 
        $$world.setBotThinkTime($this);
        $this.busy = true;
        $this.haveBaby();
        break;
    }
  }
}
/// Bot Functions End ///

function say() {
  var $wordsMax = $$wordList.length - 1;
  var $phraseSize = Math.floor((Math.random() * 5) + 1);
  var $phrase = "";
  for(var i = 0; i <= $phraseSize; i++) {
    var $wordIndex = Math.floor(Math.random() * $wordsMax);
    var $word = $$wordList[$wordIndex];
    $phrase = $phrase + " " + $word; 
  }
  return $phrase;
}

function spawnBaby($bot, $botPartner) {
  var $newBot;
  request('http://api.randomuser.me', function (error, response, data) {
  if (!error && response.statusCode == 200) {
      jsonObject = JSON.parse(data);
      var $name = jsonObject.results[0].user.name.first;
      var $gender = jsonObject.results[0].user.gender;
      $newBot = new Bot($name, $gender, $bot.getName(), $botPartner.getName());
      setTimeout(function() {
        // Time to make sure that images will be requested from randomuser.me
        io.emit("baby_bot", $newBot.information);
      }, 1000);
      
    }
  });
}

function removeFriend($$bot, $$friend) {
  var $maxFriends = $$bot.friends.length -1 ;
  for(var i = 0; i <= $maxFriends; i++) {
    if($$friend == $$bot.friends[i]) {
      var $index = $$bot.friends.indexOf($$bot.friends[i]);
      $$bot.friends.splice($index, 1);
    }
  }
}

function removeEnemy($$bot, $$enemy) {
  var $maxEnemies = $$bot.enemies.length -1 ;
  for(var i = 0; i <= $maxEnemies; i++) {
    if($$enemy == $$bot.enemies[i]) {
      var $index = $$bot.enemies.indexOf($$bot.enemies[i]);
      $$bot.enemies.splice($index, 1);
    }
  }
}

function cleanProximity($$botObject) {
  // Clean only the nextTo property of the bots affected by a walk
  var $totalNextBots = $$botObject.nextTo.length;
  var $maxNextBots = $$botObject.nextTo.length -1;
  for(var i = 0; i <= $maxNextBots; i++) {
    $nextObject = $$botObject.nextTo[i];
    $nextObject.nextTo = [];
  }
  $$botObject.nextTo = [];
}

function checkRelationship($$bot1, $$bot2) {
  var $maxEnemies = $$bot1.enemies.length -1;
  var $maxFriends = $$bot1.friends.length -1;
  var $relationShip = "none";
  // Enemy check
  for(var i = 0; i <= $maxEnemies; i++) {
    if($$bot2 == $$bot1.enemies[i]) {
      // Enemy detected
      $relationShip = "enemy";
    }
  }
  // Friend check
  for(var i = 0; i <= $maxFriends; i++) {
    if($$bot2 == $$bot1.friends[i]) {
      // Friend detected
      $relationShip = "friend";
    }
  }

  return $relationShip;
}

function checkProximity() {
  $totalBots = $botList.length;
  $maxBotIndex = $totalBots -1;
  for(var i = 0; i <= $maxBotIndex; i++) {
    var $currentIndex = i;
    var $currentBotTop = $botList[i].top;
    var $currentBotLeft = $botList[i].left;
    var $currentPosition = $currentBotLeft + $currentBotTop;
    for(var i2 = 0; i2 <= $maxBotIndex; i2++) {
      if($currentIndex != i2) {
        // Matching another bot
        $otherBotTop = $botList[i2].top;
        $otherBotLeft = $botList[i2].left;
        var $otherPosition = $otherBotLeft + $otherBotTop;

        if($currentPosition > $otherPosition) {
          var $proximityValue = $currentPosition - $otherPosition;
        } else {
          var $proximityValue = $otherPosition - $currentPosition;
        }

        if($proximityValue <= 100) {
          if($botList[$currentIndex].live) {
            // The current element is next to this element
            console.log("[INFO] "+ $botList[$currentIndex].getName() + " is next to " + $botList[i2].getName());
            $botList[$currentIndex].nextTo.push($botList[i2]);

            var $relationShip = checkRelationship($botList[$currentIndex], $botList[i2]);

            if($botList[i2].live) {
              if(!$botList[$currentIndex].busy | !$botList[i2].getName()) {
                if($relationShip == "none") {
                  console.log("[ " + $botList[$currentIndex].getName() + " ] I don't know you, " + $botList[i2].getName());
                  io.emit("think", $botList[$currentIndex].id, "I don't know you, " + $botList[i2].getName());
                }
                else if($relationShip == "friend") {
                  console.log("[ " + $botList[$currentIndex].getName() + " ] Hey " + $botList[i2].getName() + ", my friend!");
                  io.emit("think", $botList[$currentIndex].id, "Hey " + $botList[i2].getName() + ", my friend!");
                }
                else if($relationShip == "enemy") {
                  console.error("[ " + $botList[$currentIndex].getName() + " ] I HATE YOU " + $botList[i2].getName() + "!");
                  io.emit("think", $botList[$currentIndex].id, "I HATE YOU " + $botList[i2].getName() + "!");

                  var $wannaFight = Math.floor((Math.random() * 10) + 1);
                  if($wannaFight > 8) {
                    if($botList[$currentIndex].busy == false && $botList[i2].busy == false) {
                      // Both are not busy, start a fight
                      $botList[$currentIndex].fight($botList[$currentIndex], $botList[i2]);
                    }
                  }
                }
              }
            }
            else {
              console.log("[ " + $botList[$currentIndex].getName() + " ] Poor " + $botList[i2].getName() + "... died too young... ");
              io.emit("think", $botList[$currentIndex].id, "Poor " + $botList[i2].getName() + "... died too young...");
            }
          }
          else {
            // Do nothing, current bot is dead
          }
          
        }


      } else {
        // Matching same bot, just ignore
      }
    }
  }
}

function timeInfo() {
  var $hour = $$world.getHour();
  var $time = $$world.getDayTime();
  var $suffix;
  $time == "day" ? $suffix = "am" : $suffix = "pm";    
  console.warn("[ World Info ] The time now is " + $hour + " " + $suffix);
}

function initializeMatrix() {
  console.warn("[Initializing Life...]");

  $$world = new World("Project01");
  $$world.setDayTime();
  loadWords();

  $botList = [];
  // $$botHonki = new Bot("Honki", "male", "world", "world");
  // $$botBob = new Bot("Bob", "male", "world", "world");
  // $$botGeorge = new Bot("George", "male", "world", "world");
  
  // $$botAnna = new Bot("Anna", "female", "world", "world");
  // $$botTiffy = new Bot("Tiffy", "female", "world", "world");
  // $$botLux = new Bot("Lux", "female", "world", "world");   

  timeInfo();
}

initializeMatrix();