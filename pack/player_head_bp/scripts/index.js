import { world, system, ItemStack, BlockPermutation} from "@minecraft/server";

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const {player,block} = event
  const {y} = player.getRotation()
  const face = block.permutation.getState("minecraft:block_face")
  if(block.permutation.getState("mba:head_rotation") === undefined) return
  if(face == "up"){    
    let rot = y + 360*(y!=Math.abs(y))
    rot = Math.round(rot/22.5)
    rot = rot!=16?rot:0
    block.setPermutation(block.permutation.withState("mba:head_rotation",rot));
  }
  block.setPermutation(block.permutation.withState("mba:show_head",true));
});


