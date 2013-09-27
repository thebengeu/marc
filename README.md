[m(arc)](http://marc.beng.me/)
==============================

## Group Members

| Matric No | Name                  |
| --------- | --------------------- |
| A0003900B | Benedict Liang Junjie |
| A0080860H | Jerome Cheng Zhi Kai  |
| A0086826R | Yeow Kai Yao          |
| U096931E  | Eu Beng Hee           |

## Contributions

| Feature | Who? |
| ------- | ---- |
| Asynchronous file loading | Jerome |
| Backend | Beng |
| Code view | Beng |
| Distributed localStorage | Beng |
| Dropbox support | Kai Yao |
| File/folder update/delete | Benedict |
| File treeview | Jerome |
| GitHub support | Benedict |
| Online/offline event handling | Jerome |
| Recent files | Benedict |
| Settings | Kai Yao |
| Syncing with backend | Jerome |

## Setup

```bash
$ cd src
$ npm install -g bower grunt-cli
$ npm install
$ bower install
```

##  Running During Development

```bash
$ cd src
$ grunt server
# With MongoDB running:
$ node server
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
