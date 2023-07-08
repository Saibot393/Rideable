# Rideable

The module adds functionality for tokens to ride one another.

### Basic use:

To mount, select a group of tokens and press 'm' or use the 'Mount' macro while targeting(or hovering over) another token. To dismount, select all tokens you wish to dismount and press 'n' or use the "Unmount" macro. While controlling a ridden token and targeting one of its riders 'Unmount' will cause only the targeted token to dismount.

Upon mounting the module will spread the mounted tokens on the ridden token and increase their z-height relative to the ridden token. The mounted tokens will always move with the ridden token. Upon dismounting the z-height of the previously mounted tokens will be reduced again.

Ridden tokens can themselfve ride other tokens.

### Settings:

#### World:
- Tokens rideable by default: to change if tokens are rideable by default
- Riding Height: to change the relative z-height of the riders 
- Mounting distance: to limit the distance from which a token can mount another token
- Border to border distance: distance to change the way the distance for the above option is calculated
- Maximum riders per token: to limit the amounts of token that can ride the same token
- Link rotations: to link the rotation of the rider tokens to the ridden token (or vice versa with the "Move ridden on rider movement" option)
- Apply "Mounted" effect: to apply an appropriate effect to the riding token if the game system supports this
- "Rideable" trait: to use the Pf2e trait system to decide if a token can be ridden
- Familiar riding: to allow familiars to ride their master (familiars will be placed on their masters corners)
- Prevent enemy riding: to stop tokens from riding enemy tokens (GMs ignore this setting)
#### Client
- Rider movement: to decide what shall happen if a rider tries to move while still being mounted, either dismount the rider or stop the movement
- Message popups: to activate some pop ups on certain actions
- Own message popups only: to only show message popups from tokens you control
#### Tokens

### Compatibility:

The module should be compatible with all game systems on Foundry v10 and v11, though a few features are only available for the Pf2e system. Movement modules such as the Drag Ruler (including routinglib) or Stairways (only in-scene use) should work fine with the module. If you encounter any bugs please [let me know](https://github.com/Saibot393/Rideable/issues).

#### Explicit compatability:

- [Wall-Height](https://foundryvtt.com/packages/wall-height):
  - Additional setting "Use token height": to use the the ridden tokens height instead of the "Riding Height" setting
  - If the above setting is activated the ridden tokens elevation will automatically be updated should the ridden tokens height change
- [FoundryVTT Arms Reach](https://foundryvtt.com/packages/foundryvtt-arms-reach):
  - Additional setting "Use Arms Reach distance": to use the "Arms Reach" distance instead of the set Mounting distance

### Languages:

The module contains an English and a German translation

---

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/Rideable/issues).**

*If you have installed the module pre v1.1.3 i recommend uninstalling it and redownloading it. In previous versions an error in the manifest prevented Foundrys automatic module updater to find new versions, so that older versions can not be updated by Foundry directly.*
