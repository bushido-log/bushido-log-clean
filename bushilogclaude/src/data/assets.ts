// All asset require() calls - paths relative to src/data/

// 音ファイル
export const STARTUP_SOUND = require('../../sounds/startup.mp3');
export const TAP_SOUND = require('../../sounds/tap.mp3');
export const CONFIRM_SOUND = require('../../sounds/confirm.mp3');
export const RITUAL_SOUND = require('../../sounds/ritual.mp3');
export const CHECK_SOUND = require('../../sounds/check.mp3');
export const CORRECT_SOUND = require('../../sounds/correct.mp3');
export const WRONG_SOUND = require('../../sounds/wrong.mp3');
export const LEVELUP_SOUND = require('../../sounds/sfx_levelup.mp3');
export const EXP_SOUND = require('../../sounds/sfx_exp.mp3');
export const EVOLUTION_SOUND = require('../../sounds/sfx_evolution.mp3');
export const WIN_SOUND = require('../../sounds/sfx_win.mp3');
export const FAIL_SOUND = require('../../sounds/sfx_fail.mp3');
export const ATTACK_SOUND = require('../../sounds/sfx_attack.mp3');
export const ENTER_SOUND = require('../../sounds/enter.mp3');
export const FOCUS_START_SOUND = require('../../sounds/focus_start.mp3');
export const KATANA_SOUND = require('../../sounds/katana_swish.mp3');
export const SFX_POLISH = require('../../sounds/sfx_polish.mp3');
export const SFX_KATANA_SHINE = require('../../sounds/sfx_katana_shine.mp3');
export const SFX_FOOTSTEP = require('../../sounds/sfx_footstep.mp3');
export const SFX_EYE_GLOW = require('../../sounds/sfx_eye_glow.mp3');

// 道場画像
export const DOJO_GATE_DIM = require('../../assets/images/dojo_gate_dim.png');
export const DOJO_GATE_LIGHT = require('../../assets/images/dojo_gate_light.png');
export const CONSULT_BG = require('../../assets/images/consult_bg.png');

// Intro動画
export const INTRO_VIDEO = require('../../assets/intro_video.mov');

// キャラクター画像
export const CHARACTER_IMAGES: { [key: number]: any } = {
  1: require('../../assets/characters/level01.png'),
  2: require('../../assets/characters/level02.png'),
  3: require('../../assets/characters/level03.png'),
  4: require('../../assets/characters/level04.png'),
  5: require('../../assets/characters/level05.png'),
  6: require('../../assets/characters/level06.png'),
  7: require('../../assets/characters/level07.png'),
  8: require('../../assets/characters/level08.png'),
  9: require('../../assets/characters/level09.png'),
  10: require('../../assets/characters/level10.png'),
};

// 刀画像
export const KATANA_RUSTY = require('../../assets/images/katana_rusty.png');
export const KATANA_CLEAN = require('../../assets/images/katana_clean.png');

// 妖怪画像
export const YOKAI_IMAGES: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/yokai_mikkabozu.png'),
  hyakume: require('../../assets/yokai/yokai_hyakume.png'),
  deebu: require('../../assets/yokai/yokai_deebu.png'),
  atodeyaru: require('../../assets/yokai/yokai_atodeyaru.png'),
  scroll: require('../../assets/yokai/yokai_scroll.png'),
  tetsuya: require('../../assets/yokai/yokai_tetsuya.png'),
  nidoneel: require('../../assets/yokai/yokai_nidoneel.png'),
  hikakuzou: require('../../assets/yokai/yokai_hikakuzou.png'),
  peeping: require('../../assets/yokai/yokai_peeping.png'),
  mottemiteya: require('../../assets/yokai/yokai_mottemiteya.png'),
  moumuri: require('../../assets/yokai/yokai_moumuri.png'),
  atamadekkachi: require('../../assets/yokai/yokai_atamadekkachi.png'),
};

export const YOKAI_LOSE_IMAGES: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/loseyokai_mikkabozu.png'),
  hyakume: require('../../assets/yokai/loseyokai_hyakume.png'),
  deebu: require('../../assets/yokai/loseyokai_deebu.png'),
  atodeyaru: require('../../assets/yokai/loseyokai_atodeyaru.png'),
  scroll: require('../../assets/yokai/loseyokai_scroll.png'),
  tetsuya: require('../../assets/yokai/loseyokai_tetsuya.png'),
  nidoneel: require('../../assets/yokai/loseyokai_nidoneel.png'),
  hikakuzou: require('../../assets/yokai/loseyokai_hikakuzou.png'),
  peeping: require('../../assets/yokai/loseyokai_peeping.png'),
  mottemiteya: require('../../assets/yokai/loseyokai_mottemiteya.png'),
  moumuri: require('../../assets/yokai/loseyokai_moumuri.png'),
  atamadekkachi: require('../../assets/yokai/loseyokai_atamadekkachi.png'),
};

export const YOKAI_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/yokai_mikkabozu.mp4'),
  hyakume: require('../../assets/yokai/yokai_hyakume.mp4'),
  deebu: require('../../assets/yokai/yokai_deebu.mp4'),
  atodeyaru: require('../../assets/yokai/yokai_atodeyaru.mp4'),
  scroll: require('../../assets/yokai/yokai_scroll.mp4'),
  tetsuya: require('../../assets/yokai/yokai_tetsuya.mp4'),
  nidoneel: require('../../assets/yokai/yokai_nidoneel.mp4'),
  hikakuzou: require('../../assets/yokai/yokai_hikakuzou.mp4'),
  peeping: require('../../assets/yokai/yokai_peeping.mp4'),
  mottemiteya: require('../../assets/yokai/yokai_mottemiteya.mp4'),
  moumuri: require('../../assets/yokai/yokai_moumuri.mp4'),
  atamadekkachi: require('../../assets/yokai/yokai_atamadekkachi.mp4'),
};

export const YOKAI_LOSE_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/loseyokai_mikkabozu.mp4'),
  hyakume: require('../../assets/yokai/loseyokai_hyakume.mp4'),
  deebu: require('../../assets/yokai/loseyokai_deebu.mp4'),
  atodeyaru: require('../../assets/yokai/loseyokai_atodeyaru.mp4'),
  scroll: require('../../assets/yokai/loseyokai_scroll.mp4'),
  tetsuya: require('../../assets/yokai/loseyokai_tetsuya.mp4'),
  nidoneel: require('../../assets/yokai/loseyokai_nidoneel.mp4'),
  hikakuzou: require('../../assets/yokai/loseyokai_hikakuzou.mp4'),
  peeping: require('../../assets/yokai/loseyokai_peeping.mp4'),
  mottemiteya: require('../../assets/yokai/loseyokai_mottemiteya.mp4'),
  moumuri: require('../../assets/yokai/loseyokai_moumuri.mp4'),
  atamadekkachi: require('../../assets/yokai/loseyokai_atamadekkachi.mp4'),
};

// ストーリー画像
export const MIKKABOZU_EYES = require('../../assets/yokai/mikkabozu_eyes.png');
export const STORY_SCENE1_IMG = require('../../assets/story/mikkabozu_scene1.png');
export const STORY_SCENE2_IMG = require('../../assets/story/mikkabozu_scene2.png');
export const ATODEYARU_SCENE1_IMG = require('../../assets/story/atodeyaru_scene1.png');
export const ATODEYARU_SCENE2_IMG = require('../../assets/story/atodeyaru_scene2.png');
export const ATODEYARU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_atodeyaru.mp4');
export const DEEBU_SCENE1_IMG = require('../../assets/story/deebu_scene1.png');
export const DEEBU_SCENE2_IMG = require('../../assets/story/deebu_scene2.png');
export const DEEBU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_deebu.mp4');
export const MOUMURI_SCENE1_IMG = require('../../assets/story/moumuri_scene1.png');
export const MOUMURI_SCENE2_IMG = require('../../assets/story/moumuri_scene2.png');
export const MOUMURI_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_moumuri.mp4');
export const TETSUYA_SILHOUETTE = require('../../assets/yokai/tetsuya_silhouette.png');
export const MIKKABOZU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_mikkabozu.mp4');

// マップ素材
export const WORLD1_BG = require('../../assets/map/bg/world1_bg.png');
export const NODE_FIST = require('../../assets/map/nodes/node_fist.png');
export const NODE_KATANA = require('../../assets/map/nodes/node_katana.png');
export const NODE_SCROLL = require('../../assets/map/nodes/node_scroll.png');
export const NODE_BRAIN = require('../../assets/map/nodes/node_brain.png');
export const NODE_BOSS = require('../../assets/map/nodes/node_boss.png');
export const NODE_LOCKED = require('../../assets/map/nodes/node_locked.png');

// バトル敵画像
export const ENEMY_IMAGES: { [key: string]: any } = {
  enemy01: require('../../assets/enemies/enemy01.png'),
  enemy02: require('../../assets/enemies/enemy02.png'),
  enemy03: require('../../assets/enemies/enemy03.png'),
  enemy04: require('../../assets/enemies/enemy04.png'),
  enemy05: require('../../assets/enemies/enemy05.png'),
  dragon_boss01: require('../../assets/enemies/dragon_boss01.png'),
  dragon_boss02: require('../../assets/enemies/dragon_boss02.png'),
  dragon_boss03: require('../../assets/enemies/dragon_boss03.png'),
  dragon_boss04: require('../../assets/enemies/dragon_boss04.png'),
};

// Character voices
export const VOICE_MK_APPEAR = require('../../sounds/voice_mk_appear.mp3');
export const VOICE_MK_DEFEAT = require('../../sounds/voice_mk_defeat.mp3');
export const VOICE_ATO_APPEAR = require('../../sounds/voice_ato_appear.mp3');
export const VOICE_ATO_DEFEAT = require('../../sounds/voice_ato_defeat.mp3');
export const VOICE_DEEBU_APPEAR = require('../../sounds/voice_deebu_appear.mp3');
export const VOICE_DEEBU_DEFEAT = require('../../sounds/voice_deebu_defeat.mp3');
export const VOICE_MOUMURI_APPEAR = require('../../sounds/voice_moumuri_appear.mp3');
export const VOICE_MOUMURI_DEFEAT = require('../../sounds/voice_moumuri_defeat.mp3');
export const VOICE_MK2_APPEAR = require('../../sounds/voice_mk2_appear.mp3');
export const VOICE_MK2_DEFEAT = require('../../sounds/voice_mk2_defeat.mp3');
export const VOICE_TETSUYA_APPEAR = require('../../sounds/voice_tetsuya_appear.mp3');
export const BGM_MONSTER_APPEAR = require('../../sounds/bgm_monster_appear.mp3');
export const SFX_TETSUYA_APPEAR = require('../../sounds/sfx_tetsuya_appear.mp3');
export const SCREAM_VOICES = [
  require('../../sounds/shonen9-himei3.mp3'),
  require('../../sounds/shonen9-himei5.mp3'),
  require('../../sounds/shonen10-uwaa.mp3'),
  require('../../sounds/shonen8-are.mp3'),
  require('../../sounds/shonen8-tyottokituiya.mp3'),
  require('../../sounds/shonen3-yarareta.mp3'),
  require('../../sounds/shonen10-maketanoka.mp3'),
  require('../../sounds/shonen6-usosonna.mp3'),
  require('../../sounds/shonen8-itatamouugokenaiya.mp3'),
  require('../../sounds/shonen5_konnatokorode.mp3'),
  require('../../sounds/shonen6-ittanhikuyo.mp3'),
  require('../../sounds/zyosei3-haibokuda.mp3'),
  require('../../sounds/zyosei4-munendesu.mp3'),
];
export const ENDING_CLEAR_BG = require('../../assets/ending_clear_bg.png');
export const ENDING_W1_COMPLETE_BG = require('../../assets/ending_w1_complete_bg.png');

export const CONSULT_SELECT_IMG = require('../../assets/consult_select.png');
export const BATTLE_BG = require('../../assets/images/battle_bg.png');export const NIDONEEL_SCENE1_IMG = require('../../assets/story/nidoneel_scene1.png');export const NIDONEEL_SCENE2_IMG = require('../../assets/story/nidoneel_scene2.png');export const VOICE_NIDONEEL_APPEAR = require('../../sounds/voice_nidoneel_appear.mp3');export const VOICE_NIDONEEL_DEFEAT = require('../../sounds/voice_nidoneel_defeat.mp3');
