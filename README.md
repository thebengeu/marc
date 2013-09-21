2013-mobile-group-8
===================

## Group Members

| Matric No | Name                  |
| --------- | --------------------- |
| A0003900B | Benedict Liang Junjie |
| A0080860H | Jerome Cheng Zhi Kai  |
| A0086826R | Yeow Kai Yao          |
| U096931E  | Eu Beng Hee           |

## Contributions

## Setup

```bash
$ npm install -g bower grunt-cli
$ npm install
$ bower install
$ grunt server
```

## Setup Gatekeeper
```bash
$ bower install
$ npm install
$ cd app/bower_components/gatekeeper
$ node server.js
```

### Setup on Windows
Download nodejs Windows installer http://nodejs.org/download/

Download ruby Windows installer (I used Ruby 2.0.0-p247) http://rubyinstaller.org/downloads/

Install the above. Get the installers to add node and ruby to the system path

Open cmd and cd to the folder where you have the git repo
```
npm install -g bower grunt-cli
bower install
npm install -g
npm install grunt-lib-contrib
gem install compass
grunt server
```
