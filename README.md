# Rideable

The module adds functionality for tokens to ride one another.

### Basic use:

To mount, select a group of tokens and press 'm' or use the 'Mount' macro while targeting(or hovering over) another token. To dismount, select all tokens you wish to dismount and press 'n' or use the "Unmount" macro. While controlling a ridden token and targeting one of its riders 'Unmount' will cause only the targeted token to dismount.

Upon mounting the module will spread the mounted tokens on the ridden token and increase their z-height relative to the ridden token. The mounted tokens will always move with the ridden token. Upon dismounting the z-height of the previously mounted tokens will be reduced again.

Ridden tokens can themselfve ride other tokens.

Since v2.2.0 the module also has basic support for tokens to grapple one another (target a token while having another token selected and press 'k', has to be turned on in the settings).

### Settings:

#### World:
- Tokens rideable by default: to change if tokens are rideable by default
- Riding Height: to change the relative z-height of the riders 
- Mounting distance: to limit the distance from which a token can mount another token
- Border to border distance: distance to change the way the distance for the above option is calculated
- Maximum riders per token: to limit the amounts of tokens that can ride the same token
- Link rotations: to link the rotation of the rider tokens to the ridden token (or vice versa with the "Move ridden on rider movement" option)
- Apply "Mounted" effect: to apply an appropriate effect to the riding token if the game system supports this
- "Rideable" trait: to use the Pf2e trait system to decide if a token can be ridden
- Familiar riding: to allow familiars to ride their master (familiars will be placed on their masters corners)
- Grappling: to allow tokens to grapple one another
- Prevent enemy riding: to stop tokens from riding enemy tokens (GMs ignore this setting)
#### Client:
- Rider movement: to decide what shall happen if a rider tries to move while still being mounted, either dismount the rider, stop the movement or move the ridden token
- Message popups: to activate some popups on certain actions
- Own message popups only: to only show message popups from tokens you control
#### Tokens (separate tab):
- Token is Rideable: to override world default for this token
- Maximum riders: to override world default for this token
- Rider positioning: to set in which pattern rider tokens should be placed (Row or Circle)
- Token form: to set the form used to define this tokens border (Circle/Ellipse or Rectangle)
- Riders can move freely: to allow riders to move freely within this tokens borders (if the token is moved, all riders will keep their relative position)
- Spawn riders (GM only): to set with which riders this token spawns

### Compatibility:

The module should be compatible with all game systems on Foundry v10 and v11, though a few features are only available for the Pf2e system. Movement modules such as the Drag Ruler (including routinglib) should work fine with the module. If you encounter any bugs please [let me know](https://github.com/Saibot393/Rideable/issues).

#### Explicit compatability:

- [FoundryVTT Arms Reach](https://foundryvtt.com/packages/foundryvtt-arms-reach)/[Arms Reach](https://foundryvtt.com/packages/arms-reach):
  - Additional setting "Use Arms Reach distance": to use the "Arms Reach" distance instead of the set Mounting distance
- [Stairways](https://foundryvtt.com/packages/stairways):
  - Supports both in- and cross-scene stairways
  - Riders will follow their ridden token through stairways
  - If the option "Move ridden Token" is active, the ridden token will follow its riders through stairways
  - If a users (standard) character gets teleported in one of this ways, the user will switch scenes
  - If the option "Prevent movement" for rider tokens is active, riders will be prevented from using stairways (GMs can override this)
- [Wall-Height](https://foundryvtt.com/packages/wall-height):
  - Additional setting "Use token height": to use the ridden tokens height instead of the "Riding Height" setting
  - If the above setting is activated the ridden tokens elevation will automatically be updated should the ridden tokens height change

### Languages:

The module contains an English and a German translation

---

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/Rideable/issues).**
