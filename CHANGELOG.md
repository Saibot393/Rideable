## v1.6.0
- added on-token setting for maximum riders (overrides world setting)
- added support for arms reach
  - added an option which overrides the mounting distance with the arms-reach distance
    
## v1.5.1
- fixed a bug that appeared when only a familiar was riding a token
  
## v1.5.0
- improved localization file structure
- fixed bug concerning the border-to-border mounting distance
- fixed bug concerning the positioning of the ridden token when "Move ridden on rider movement" is used
- GMs can now force change the riding height of tokens (unless "Move ridden on rider movement" is activated)
- Added "Link rotations" options to allow ridden tokens to rotate their riders (or vice versa with the "Move ridden on rider movement" option)
- Added additional popups for cases where tokens cant be mounted
- Added compatibility for the "Wall-Height" module by adding an option which allows the riding height to be set through the token height (see "Wall-Height" module) of the ridden token

## v1.4.0
- added "Move ridden on rider movement" option, only happens if the owner of the rider is also an owner of the ridden token
- added maximum riders option
- added optional text pop up for some actions (mount, unmount, prevented movement)
- minor bug fixes

## v1.3.0
- added option to prevent tokens from riding enemy tokens (GM can override this)
  
## v1.2.0
- added future infrastructure for module compatibility
- Riders now teleport when the ridden token is teleported
  - Rideable is now compatibile with in-scene use of the stairways module

## v1.1.3
- fixed riding loops
- fixed manifest error which caused Foundrys automatic module update to not find the newest version

## v1.1.2
- small bug fix regarding pf2e Rideable tag system
  
## v1.1.1
- added 'Familiar riding' macro
  
## v1.1.0
- added support for "Familiar riding" which allows familiars of characters to ride their tokens. Familiars will be placed at the corners of their masters (has to be switched on in the settings menu)
- Fixed a bug which prevented the z-level of riding tokens to be updated

## v1.0.0
First release on Foundry
