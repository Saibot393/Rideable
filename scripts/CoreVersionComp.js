export function sceneof(pToken) {
	let vscene = pToken.scene;
	
	switch (pToken.documentName) {
		case "Token":
			if (!vscene) {
				//for FVTT v10
				if (canvas.scene.tokens.get(pToken.id)) {
					return canvas.scene;
				}
				else {
					return game.scenes.find(vscene => vscene.tokens.get(pToken.id));
				}
			}
			break;
		case "Tile":
			if (!vscene) {
				//for FVTT v10
				if (canvas.scene.tiles.get(pToken.id)) {
					return canvas.scene;
				}
				else {
					return game.scenes.find(vscene => vscene.tiles.get(pToken.id));
				}
			}
			break;
	}
	
	return vscene;
}