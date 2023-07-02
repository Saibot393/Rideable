# Rideable

The module adds functionality for tokens to ride one another.

### Basic use:

To mount, select a group of tokens and press 'm' or use the 'Mount' macro while targeting(or hovering over) another token. To dismount, select all tokens you wish to dismount and press 'n' or use the "Unmount" macro. While controlling a ridden token and targeting one of its riders 'Unmount' will cause only the targeted token to dismount.

Upon mounting the module will spread the mounted tokens on the ridden token and increase their z-height relative to the ridden token. The mounted tokens will always move with the ridden token. Upon dismounting the z-height of the previously mounted tokens will be reduced again.

Ridden tokens can themselfve ride other tokens.

### Settings:

- Riding Height: to change the relative z-height of the riders 
- Mounting distance: to limit the distance from which a token can mount another token
- Border to border: distance to change the way the distance for the above option is calculated
- Rider movement: to decide what shall happen if a rider tries to move while still being mounted, either dismount the rider or stop the movement
- Apply "Mounted" effect: to apply an appropriate effect to the riding token if the game system supports this
- Mounts require "Rideable" trait: to use the Pf2e trait system to decide if a token can be ridden
- Familiar riding: to allow familiars to ride their master (familiars will be placed on their masters corners)
- Prevent enemy riding: to stop tokens from riding enemy tokens (GMs ignore this setting)

### Compatibility:

The module should be compatible with all game systems on Foundry v10 and v11, though a few features are only available for the Pf2e system. Movement modules such as the Drag Ruler (including routinglib) or Stairways (only in-scene use) should work fine with the module. If you encounter any bugs please [let me know](https://github.com/Saibot393/Rideable/issues).

### Languages:

The module contains an English and a German translation

---

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/Rideable/issues).**

*If you have installed the module pre v1.1.3 i recommend uninstalling it and redownloading it. In previous versions an error in the manifest prevented Foundrys automatic module updater to find new versions, so that older versions can not be updated by Foundry directly.*
