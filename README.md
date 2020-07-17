# eyePause 1.0 👀⏸

Take periodic rests from your computer screen with the help of eyePause! Running in the background, it will alert you when it's time to step away. 

Preset to take 5-minute breaks every 30 minutes, but can be configured in the eyePause menu. 

Built using Electron on Javascript. Works right out of the box, ***supported on Windows, Linux, and macOS!***

## Screenshots
![Main Menu](https://dl.dropboxusercontent.com/s/99eorgwljnm5jvu/homescreen.png?dl=0)
![Disabled](https://dl.dropboxusercontent.com/s/8ejprasml3haddl/disabled.png?dl=0)
![Break Overlay](https://dl.dropbox.com/s/xmjwwx6uusbm0ta/break.png?dl=0)

## Install
### Release (recommended)
Head over to the [releases page](https://github.com/richardso21/eyePause/releases) of this repository, where you can download the installers with **.exe, .deb, or .rpm file extensions**. 

*Note: **all releases only support x64**, and **no installer executables are released for macOS at the moment**. If you are running on a different architecture or macOS, **build from source** as documented below.*
### Source
Building from source code is pretty easy, but let me take you through the process:
1. Clone this repo either by the command below or any other way that you prefer:
```
git clone https://github.com/richardso21/eyePause.git
```
2. Enter the folder you just cloned (probably `eyePause`), and install prerequisites for the app with `npm`:
```
cd eyePause
npm install
```
3. Run the app
```
npm run start
```
4. *(optional) Make the installer executable on your end and execute the installer. The installer will be located in the `out` directory:*
```
npm run make
cd out/make
...
```
