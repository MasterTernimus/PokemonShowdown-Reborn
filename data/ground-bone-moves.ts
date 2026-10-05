/** Field-only exceptions; preserves existing ability-driven type changes and bone immunity rules. */
export function isGroundBoneMove(move: { id: string, type: string }) {
	return move.type === 'Ground' && ['boneclub', 'bonerush', 'bonemerang'].includes(move.id);
}
