# Rideable

The module adds functionality for tokens to ride one another.

### Basic use:

To mount, select a group of tokens and press 'm' or use the 'Mount' macro while targeting(or hovering over) another token. To dismount, select all tokens you wish to dismount and press 'n' or use the "Unmount" macro. While controlling a ridden token and targeting one of its riders 'Unmount' will cause only the targeted token to dismount.

Upon mounting the module will spread the mounted tokens on the ridden token and increase their z-height relative to the ridden token. The mounted tokens will always move with the ridden token. Upon dismounting the z-height of the previously mounted tokens will be reduced again.

Ridden tokens can themself ride other tokens.

A tutorial for some of the features can be found [here](https://www.youtube.com/watch?v=tzM8pdGqYVg).

Since v2.13.0 Rideable also has a feature for Token following.

### Settings:

#### World:
- Tokens rideable by default: to change if tokens are rideable by default
- Tiles can be mounted[*v11 upwards*]: to enable tile mounting feature
- Allow mount on enter: to activate the mount on enter feature in this world (*turn off to increase performance*)
- Riding Height: to change the relative z-height of the riders
- Use riding height by default: to set wether tokens/tiles should use the riding height per default for their riders
- Mounting distance: to limit the distance from which a token can mount another token
- Border to border distance: distance to change the way the distance for the above option is calculated
- Maximum riders per token: to limit the amounts of tokens that can ride the same token
- Link rotations: to link the rotation of the rider tokens to the ridden token (or vice versa with the "Move ridden on rider movement" option)
- Apply "Mounted" effect: to apply an appropriate effect to the riding token if the game system supports this
- Custom riding effects: to list effects that should be applied to tokens when they start riding
- "Rideable" trait: to use the Pf2e trait system to decide if a token can be ridden
- Familiar riding: to allow familiars to ride their master (familiars will be placed on their masters corners)
- Familiar riding position: to set the corner familiars will be positioned first
- Grappling: to allow tokens to grapple one another
- Apply "Grappled" effect to: apply a system dependent effect on grappled tokens
- Stop grapple on effect removal: to stop the grapple when the as soon as the effect is removed
- Prevent enemy riding: to stop tokens from riding enemy tokens (GMs ignore this setting)
- Adjust rider size: to reduce the size of riders should their size be greater or equal to the size of the ridden token
- Adjusted rider size factor: to set the factor by which the size of riders of smaller tokens is adjusted
- Rider movement default setting: to set the default Rider movement behaviour for new players
- Mount button default position: to set the world default position for the mount button
- Enable Token following: to use the Token following feature
- Following algorithm: to choose the algorithm used for the following feature
- In combat follow behaviour: to set how following tokens should behave once combat starts
- Only follow visible: to set wether tokens can only follow tokens they can see
- Prevent Follower stacking: to prevent followers of the same token from stacking ontop of one another
#### Client:
- Rider movement: to decide what shall happen if a rider tries to move while still being mounted, either dismount the rider, stop the movement or move the ridden token
- Mount button position: to set the position of the mount button or disable it
- Rider proxy select: to select ridden tokens instead of riders
- Message popups: to activate some popups on certain actions
- Own message popups only: to only show message popups from tokens you control
- Follower movement: to set how followers should behave when they are moved independently of the token they follow
#### Tokens (separate tab):
- Token is Rideable: to override world default for this token
- Mount on enter: to mount tokens that enter this token/tile automatically
- Mount on enter blacklist: to prevent certain tokens or actors from mounting on entering
- Mount on enter whitelist: to set list tokens that can mount on enter this object
- Tile name [*Tiles only*]: to set the name rideable will use for this tile
- Maximum riders: to override world default for this token
- Custom riding height: to set the height used for tokens riding this token
- Use riding height: to set wether this token should use the riding height per default for its riders
- Riders scale: to set a (graphical) scale for riders of this object
- Rider positioning: to set in which pattern rider tokens should be placed (Row or Circle)
- Riders offset: to configure an x,y offset for riders
- Riders rotational offset: to configure an rotational offset for riders
- Grappled placement: to set where tokens grappled by this token are placed
- Token form: to set the form used to define this tokens border (Circle/Ellipse or Rectangle)
- Riders can move freely: to allow riders to move freely within this tokens borders (if the token is moved, all riders will keep their relative position)
- Spawn riders (GM only): to set with which riders this token spawns
- Riding effects (GM only): to set effects tokens gain when they start riding this token
- Override world riding effects (GM only): to override the world standard riding effects with the tokens effects (instead of appending them)
- Self apply riding effects (GM only): to make this token apply its own Riding effects while riding
- Mount effects (GM only): to set effects that are applied to the mount of this token
- Can be grappled(GM only): to enabled/disable the grapple feature on this token
- Can be piloted(GM only): to allow players to pilot this token/tile
- Piloted by default(GM only): to make this token piloted by every rider automatically

### Compatibility:

The module should be compatible with all game systems on Foundry v10 and v11, though a few features are only available for the Pf2e system. Movement modules such as the Drag Ruler (including routinglib) should work fine with the module. If you encounter any bugs please [let me know](https://github.com/Saibot393/Rideable/issues).

#### Explicit compatability:

- [routinglib](https://foundryvtt.com/packages/routinglib):
  - Additional option for world setting Following algorithm: routinglib
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
- [Lock & Key](https://foundryvtt.com/packages/locknkey):
  - Has to be activated with the setting "Lock & Key integration"
  - Rideable tokens are lockeable
  - Locked tokens can not be mounted or unmounted
- [Tagger](https://foundryvtt.com/packages/tagger/):
  - Has to be activated with the setting "Tagger integration"
  - Adding the Tag "Rideable:{TokenID}" to a token/tile will mount the appropiate token
  - Removing this tag will unmount the token
- [DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects):
  - Must be activated with the world setting DFreds Convenient Effects Integration
  - Allows for effects to be applied to mounted and grappled tokens
  - Allows for custom mounted effects to be set
- [Token Attacher](https://foundryvtt.com/packages/token-attacher/):
  - "Riding loops" should not be possible
  - Adds token form "from attached tiles" to use attached tiles as the form of this token
    - The attached tiles should NOT be set as rideable, it will not directly cause any bugs but strange behaviour
    - The attached tiles set token form will be respected and combined to create the full rideable area
    - When using keys or macros to mount the attached tiles can be hovered instead of the token
    - The mounting distance will be measured from all attached tiles (only one has to be in range)
  - Adds tile form "No form/ignore" to enhance above feature
- [Monk's Active Tile Triggers](https://foundryvtt.com/packages/monks-active-tiles)
  - Adds Rideable action "Mount this tile" to mount the triggering tokens to this tile
  - Adds Rideable action "Mount" to mount a set of tokens to specified token/tile
  - Adds Rideable action "Unmount" to unmount a set of tokens
  - Adds Rideable action "Unmount riders" to unmount the riders of a given token/tile
  - Adds Rideable action "Toggle mount" to change teh riding state of a set of tokens regarding a given token/tile
  - Adds Rideable filter "Filter riders of mount" to filter the riders of a given token/tile
  - Adds Rideable filter "Filter riders" to filter tokens that currently are riding
  - Adds Rideable filter "Filter ridden" to filter tokens that currently are ridden


### Languages:

The module contains an English and a German translation. If you want additional languages to be supported [let me know](https://github.com/Saibot393/Rideable/issues).

### Macros:
- `game.Rideable.MountSelected(pTargetHovered)`
  - To mount the selected Tokens to the targeted token
  -  `pTargetHovered` (optional): boolean, to also use hovered tokens as potential targets
- `game.Rideable.MountSelectedFamiliar(pTargetHovered)`
  - To mount the selected Tokens to the targeted token as a familiar
  - `pTargetHovered` (optional): boolean, to also use hovered tokens as potential targets
- `game.Rideable.GrappleTargeted(pTargetHovered)`
  - To grapple the targeted Tokens as the selected token
  - `pTargetHovered` (optional): boolean, to also use hovered tokens as potential targets
- `game.Rideable.UnMountSelected()`
  - To unmount the selected Tokens
- `game.Rideable.Mount(pselectedTokens, pTarget, pRidingOptions)`
  - To mount multiple specified tokens to a target
  - `pselectedTokens`: array of token documents, tokens which are to be mounted
  - `pTarget`: token document, token on which tokens are to be mounted
  - `pRidingOptions`: 
    - `Familiar`: boolean, to mount `pselectedTokens` as familiars
    - `Grappled`: boolean, to mount `pselectedTokens` as grappled
- `game.Rideable.UnMount(pTokens)`
  - To unmount multiple specified tokens
  - `pTokens`: array of token documents, tokens which are to be unmounted
- `game.Rideable.UnMountallRiders(pRidden)`
  - To unmount all riders from a token
  - `pRidden`: token document, token from which all riders are to be unmounted
- `game.Rideable.MountbyID(pselectedTokens, pTarget, pRidingOptions)`
  - To mount multiple specified tokens to a target
  - `pselectedTokens`: array of token ids, tokens which are to be mounted
  - `pTarget`: token id, token on which tokens are to be mounted
  - `pRidingOptions`: 
    - `Familiar`: boolean, to mount `pselectedTokens` as familiars
    - `Grappled`: boolean, to mount `pselectedTokens` as grappled
- `game.Rideable.UnMountbyID(pTokens)`
  - To unmount multiple specified tokens
  - `pTokens`: array of token ids, tokens which are to be unmounted
- `game.Rideable.UnMountallRidersbyID(pRidden)`
  - To unmount all riders from a token
  - `pRidden`: token id, token from which all riders are to be unmounted

---

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/Rideable/issues).**
