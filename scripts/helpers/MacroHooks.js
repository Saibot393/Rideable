import { MountSelected, MountSelectedFamiliar, UnMountSelected, GrappleTargeted, ToggleMountselected } from "../MountingScript.js";
import { Mount, UnMount, UnMountallRiders, MountbyID, UnMountbyID, UnMountallRidersbyID } from "../MountingScript.js";

//functions for macros
Hooks.on("init",() => {
	game.Rideable = {
		MountSelected, //game.Rideable.MountSelected() -> Makes selected Tokens Ride targeted Token
		MountSelectedFamiliar,
		UnMountSelected,
		GrappleTargeted,
		Mount,
		UnMount,
		UnMountallRiders,
		MountbyID,
		UnMountbyID,
		UnMountallRidersbyID,
		ToggleMountselected
	};
});