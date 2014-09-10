# Spare Me #

Spare Me is a game about bowling, a fun way to learn math, a love letter to the
world's second best solitaire card game. Built for an iPhone, it should run in
most browsers. Save games are supported and high scores are sharable. There are
Easter eggs when you win, tributes when you lose, and the difficulty is as hard
as you make it. Have fun.

Made on a Mac for the [js13kGames competition][comp].

## Features ##

Spare Me has the following bits of awesomeness:

* play on any device with sweet scaling graphics
* get social bragging rights with tweetable high scores
* never lose your place with automatic save games
* crank up the competition with dynamic difficulty levels
* start bowling fast with an in-line tutorial

## Credits ##

Spare Me was inspired by Sid Sackon's card game, _Bowling Solitaire_. I first
heard about it from [Neil Thomson's review on Board Game Geek][bgg]. The rules
are simple but the scoring is complex, and I felt that made it an ideal candidate
for js13kGames. My version pawns off the adjacency rules as difficulty levels
and ditches playing cards for thematic graphics.

### Technology ###

Spare Me uses a pseudo random number generator based on the one described in
the paper, _A New Class of Invertible Mappings_, by Alexander Klimov and Adi
Shamer.

### Graphics ###

All the graphics for Spare Me, with the exception of the GitHub Octocat and
Twitter Bird, where created with HTML5 and CSS3. The background wood texture
is a color shifted version of [Randy Merrill's cicada stripes pattern][stripes].
The pins and balls where based on [Donovan Hutchinson's tutorial on CSS
spheres][spheres]. Button styling comes from [Rishabh's demo for pushable
buttons][buttons]. The paper for score keeping and rules is [Sarah Backhouse's
lined paper pattern][paper] and the sticky tape that holds it up comes from
[Sharon's tutorial][tape]. The pencil is a tiny tilted version of [Bryce
Snyder's flat pencil][pencil]. The text that shows up on strikes and spares is
[Mark Dotto's design][text].  Finally, the title is done in the same neon that
[Dudley Storey uses for his bar sign][neon].

### Help ###

[Sarah Mitchell][sm] pushed me to make the graphics better, and then took
took them to a whole new level by doing the pencil resize that shows up in
the [icon][] and [screenshot][]. [Jon Gherardini][jg] pointed out how crazy
hard the rules where, which became the driver behind difficulty levels.

## Compatibility ##

Spare Me works in the following browsers:

* Firefox 32
* Chrome 37
* Safari 5.1
* Opera 12.16
* iOS Safari 6.1
* iOS Safari 7.1
* Chrome for Android 37

## License ##

Spare Me is licensed under a MIT license. See the LICENSE file for more details.


[comp]: http://js13kgames.com/ "Andrezj Mazur (Enclave Games): HTML5 and JavaScript game development competition in just 13 kB"
[bgg]: http://boardgamegeek.com/thread/1163813/sid-sacksons-bowling-solitaire-detailed-review "Neil Thomson (Board Game Geek): Sid Sackson's Bowling Solitaire - A Detailed Review"
[stripes]: http://lea.verou.me/css3patterns/#cicada-stripes "Lea Verou (CSS3 Patterns Gallery): Cicada stripes by Randy Merrill"
[spheres]: http://learnsome.co/blog/spheres/ "Donovan Hutchinson: (Learnsome): CSS Spheres"
[buttons]: http://cssdeck.com/labs/push-the-buttons "Rishabh (CSS Deck): Push the Buttons"
[paper]: http://lea.verou.me/css3patterns/#lined-paper "Lea Verou (CSS3 Patterns Gallery): Lined paper by Sarah Backhouse"
[tape]: http://cssdemos.tupence.co.uk/stepbystep/stepbystep-stickytape.htm "Sharon (Grains of Sand): Sticky Tape - Step by Step Guide"
[pencil]: http://codepen.io/brycesnyder/pen/nhoIu "Bryce Snyder (Code Pen): Pure CSS3 Flat Pencil"
[text]: http://markdotto.com/playground/3d-text/ "Mark Dotto: 3D Text"
[neon]: http://demosthenes.info/blog/477/CSS3-Neon-Sign "Dudley Storey (demosthenes.info): CSS3 Neon Sign"
[sm]: https://github.com/thesmitchell "Sarah Mitchell (GitHub): TheSmitchell"
[icon]: https://github.com/onefrankguy/spare-me/blob/master/img/icon-small.png "Frank Mitchell (GitHub): Icon for Spare Me"
[screenshot]: https://github.com/onefrankguy/spare-me/blob/master/img/icon-big.png "Frank Mitchell (GitHub): Screenshot for Spare Me"
[jg]: https://github.com/jaeger401 "Jon Gherardini (GitHub): jaeger401"
