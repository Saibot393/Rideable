import { MountSelected, MountSelectedFamiliar, UnMountSelected } from "./MountingScript.js";

//functions for macros
Hooks.on("init",() => {
	game.Rideable = {
		MountSelected, //game.Rideable.MountSelected() -> Makes selected Tokens Ride targeted Token
		MountSelectedFamiliar,
		UnMountSelected
	};
});