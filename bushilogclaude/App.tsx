// App.tsx (refactor / rewrite)
// BUSHIDO LOG - single file version (keeps your current features)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  Image,
  ImageBackground,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { initializePurchases, checkProStatus, getOffering, purchasePro, restorePurchases, getMonthlyPrice, getAnnualPrice, purchaseAnnual } from './src/services/purchaseService';
import { PurchasesPackage } from 'react-native-purchases';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// =========================
// Config / Constants
// =========================

const API_BASE = "https://bushido-log-server.onrender.com";
const SAMURAI_TTS_URL = `${API_BASE}/tts`;
const SAMURAI_CHAT_URL = `${API_BASE}/samurai-chat`;
const SAMURAI_MISSION_URL = `${API_BASE}/mission`;

// 音ファイル
const STARTUP_SOUND = require('./sounds/startup.mp3');
const TAP_SOUND = require('./sounds/tap.mp3');
const CONFIRM_SOUND = require('./sounds/confirm.mp3');
const RITUAL_SOUND = require('./sounds/ritual.mp3');
const CHECK_SOUND = require('./sounds/check.mp3');
const CORRECT_SOUND = require('./sounds/correct.mp3');
const WRONG_SOUND = require('./sounds/wrong.mp3');const LEVELUP_SOUND = require('./sounds/sfx_levelup.mp3');const EXP_SOUND = require('./sounds/sfx_exp.mp3');const EVOLUTION_SOUND = require('./sounds/sfx_evolution.mp3');const WIN_SOUND = require('./sounds/sfx_win.mp3');const FAIL_SOUND = require('./sounds/sfx_fail.mp3');const ATTACK_SOUND = require('./sounds/sfx_attack.mp3');
const ENTER_SOUND = require('./sounds/enter.mp3');
const FOCUS_START_SOUND = require('./sounds/focus_start.mp3');
const KATANA_SOUND = require('./sounds/katana_swish.mp3');

// 道場の門 画像
const DOJO_GATE_DIM = require('./assets/images/dojo_gate_dim.png');
const DOJO_GATE_LIGHT = require('./assets/images/dojo_gate_light.png');
const CONSULT_BG = require('./assets/images/consult_bg.png');

// Intro動画
const INTRO_VIDEO = require('./assets/intro_video.mov');

// キャラクター画像（レベル別）
const CHARACTER_IMAGES: { [key: number]: any } = {
  1: require('./assets/characters/level01.png'),
  2: require('./assets/characters/level02.png'),
  3: require('./assets/characters/level03.png'),
  4: require('./assets/characters/level04.png'),
  5: require('./assets/characters/level05.png'),
  6: require('./assets/characters/level06.png'),
  7: require('./assets/characters/level07.png'),
  8: require('./assets/characters/level08.png'),
  9: require('./assets/characters/level09.png'),
  10: require('./assets/characters/level10.png'),
};




// ===== Kegare (Katana Polishing) =====
const KATANA_RUSTY = require('./assets/images/katana_rusty.png');
const KATANA_CLEAN = require('./assets/images/katana_clean.png');
const SFX_POLISH = require('./sounds/sfx_polish.mp3');
const SFX_KATANA_SHINE = require('./sounds/sfx_katana_shine.mp3');

const KEGARE_QUOTES = [
  '刀を磨く者、心も磨かれる',
  '錆びた刀では、己は斬れぬ',
  '日々の手入れが、真の強さを生む',
  '武士の朝は、刀と共に始まる',
  '磨かれた刃は、迷いを断つ',
];

// ===== YOKAI SYSTEM =====
const YOKAI_IMAGES: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/yokai_mikkabozu.png'),
  hyakume: require('./assets/yokai/yokai_hyakume.png'),
  deebu: require('./assets/yokai/yokai_deebu.png'),
  atodeyaru: require('./assets/yokai/yokai_atodeyaru.png'),
  scroll: require('./assets/yokai/yokai_scroll.png'),
  tetsuya: require('./assets/yokai/yokai_tetsuya.png'),
  nidoneel: require('./assets/yokai/yokai_nidoneel.png'),
  hikakuzou: require('./assets/yokai/yokai_hikakuzou.png'),
  peeping: require('./assets/yokai/yokai_peeping.png'),
  mottemiteya: require('./assets/yokai/yokai_mottemiteya.png'),
  moumuri: require('./assets/yokai/yokai_moumuri.png'),
  atamadekkachi: require('./assets/yokai/yokai_atamadekkachi.png'),
};

const YOKAI_LOSE_IMAGES: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/loseyokai_mikkabozu.png'),
  hyakume: require('./assets/yokai/loseyokai_hyakume.png'),
  deebu: require('./assets/yokai/loseyokai_deebu.png'),
  atodeyaru: require('./assets/yokai/loseyokai_atodeyaru.png'),
  scroll: require('./assets/yokai/loseyokai_scroll.png'),
  tetsuya: require('./assets/yokai/loseyokai_tetsuya.png'),
  nidoneel: require('./assets/yokai/loseyokai_nidoneel.png'),
  hikakuzou: require('./assets/yokai/loseyokai_hikakuzou.png'),
  peeping: require('./assets/yokai/loseyokai_peeping.png'),
  mottemiteya: require('./assets/yokai/loseyokai_mottemiteya.png'),
  moumuri: require('./assets/yokai/loseyokai_moumuri.png'),
  atamadekkachi: require('./assets/yokai/loseyokai_atamadekkachi.png'),
};

const YOKAI_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/yokai_mikkabozu.mp4'),
  hyakume: require('./assets/yokai/yokai_hyakume.mp4'),
  deebu: require('./assets/yokai/yokai_deebu.mp4'),
  atodeyaru: require('./assets/yokai/yokai_atodeyaru.mp4'),
  scroll: require('./assets/yokai/yokai_scroll.mp4'),
  tetsuya: require('./assets/yokai/yokai_tetsuya.mp4'),
  nidoneel: require('./assets/yokai/yokai_nidoneel.mp4'),
  hikakuzou: require('./assets/yokai/yokai_hikakuzou.mp4'),
  peeping: require('./assets/yokai/yokai_peeping.mp4'),
  mottemiteya: require('./assets/yokai/yokai_mottemiteya.mp4'),
  moumuri: require('./assets/yokai/yokai_moumuri.mp4'),
  atamadekkachi: require('./assets/yokai/yokai_atamadekkachi.mp4'),
};

const YOKAI_LOSE_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/loseyokai_mikkabozu.mp4'),
  hyakume: require('./assets/yokai/loseyokai_hyakume.mp4'),
  deebu: require('./assets/yokai/loseyokai_deebu.mp4'),
  atodeyaru: require('./assets/yokai/loseyokai_atodeyaru.mp4'),
  scroll: require('./assets/yokai/loseyokai_scroll.mp4'),
  tetsuya: require('./assets/yokai/loseyokai_tetsuya.mp4'),
  nidoneel: require('./assets/yokai/loseyokai_nidoneel.mp4'),
  hikakuzou: require('./assets/yokai/loseyokai_hikakuzou.mp4'),
  peeping: require('./assets/yokai/loseyokai_peeping.mp4'),
  mottemiteya: require('./assets/yokai/loseyokai_mottemiteya.mp4'),
  moumuri: require('./assets/yokai/loseyokai_moumuri.mp4'),
  atamadekkachi: require('./assets/yokai/loseyokai_atamadekkachi.mp4'),
};

type YokaiFeature = 'consult' | 'gratitude' | 'goal' | 'review' | 'focus' | 'alarm';

interface YokaiData {
  id: string;
  name: string;
  quote: string;
  defeatQuote: string;
  features: YokaiFeature[];
}

const YOKAI_LIST: YokaiData[] = [
  { id: 'mikkabozu', name: '\u4e09\u65e5\u574a\u4e3b', quote: '\u3069\u3046\u305b\u307e\u305f\u3084\u3081\u308b\u3093\u3060\u308d\uff1f', defeatQuote: '\u304f\u305d\u2026\u7d9a\u3051\u3084\u304c\u3063\u305f\u306a\u2026', features: ['consult', 'goal'] },
  { id: 'hyakume', name: '\u901a\u77e5\u767e\u76ee', quote: '\u307b\u3089\u3001\u307e\u305f\u901a\u77e5\u304c\u6765\u305f\u305e\uff01', defeatQuote: '\u304a\u524d\u2026\u901a\u77e5\u3092\u7121\u8996\u3067\u304d\u308b\u306e\u304b\u2026', features: ['focus'] },
  { id: 'deebu', name: '\u30c7\u30fc\u30d6', quote: '\u4eca\u65e5\u306f\u3082\u3046\u4f11\u3082\u3046\u305c\u301c', defeatQuote: '\u3046\u305d\u3060\u308d\u2026\u307e\u3060\u52d5\u3051\u308b\u306e\u304b\u2026', features: ['goal', 'focus'] },
  { id: 'atodeyaru', name: '\u30a2\u30c8\u30c7\u30e4\u30eb', quote: '\u660e\u65e5\u3084\u308c\u3070\u3044\u3044\u3058\u3083\u3093', defeatQuote: '\u30d0\u30ab\u306a\u2026\u4eca\u3084\u3063\u3061\u307e\u3046\u306e\u304b\u2026', features: ['consult', 'goal'] },
  { id: 'scroll', name: '\u30b9\u30af\u30ed\u30fc\u30eb\u5996\u602a', quote: '\u3082\u3046\u3061\u3087\u3063\u3068\u3060\u3051\u898b\u3066\u3044\u3053\u3046\u3088', defeatQuote: '\u30b9\u30de\u30db\u3092\u7f6e\u3044\u305f\u3060\u3068\u2026\uff01', features: ['focus'] },
  { id: 'tetsuya', name: '\u5fb9\u591c', quote: '\u307e\u3060\u5bdd\u306a\u304f\u3066\u3044\u3044\u3060\u308d\uff1f', defeatQuote: '\u304f\u305d\u2026\u3061\u3083\u3093\u3068\u5bdd\u308b\u306e\u304b\u3088\u2026', features: ['alarm', 'focus'] },
  { id: 'nidoneel', name: '\u30cb\u30c9\u30cd\u30fc\u30eb', quote: '\u3042\u3068\uff15\u5206\u3060\u3051\u2026\u3042\u3068\uff15\u5206\u2026', defeatQuote: '\u5634\u2026\u4e00\u767a\u3067\u8d77\u304d\u305f\u3060\u3068\u2026\uff01', features: ['alarm'] },
  { id: 'hikakuzou', name: '\u6bd4\u8f03\u5bf8\u8535', quote: '\u3042\u3044\u3064\u306e\u65b9\u304c\u4e0a\u3060\u305e\uff1f', defeatQuote: '\u304f\u305d\u2026\u81ea\u5206\u3060\u3051\u898b\u3066\u3084\u304c\u308b\u2026', features: ['gratitude'] },
  { id: 'peeping', name: '\u30d4\u30fc\u30d4\u30f3\u30af\u30c8\u30e0', quote: '\u4ed6\u4eba\u306e\u3053\u3068\u304c\u6c17\u306b\u306a\u308b\u3060\u308d\uff1f', defeatQuote: '\u4ed6\u4eba\u3058\u3083\u306a\u304f\u81ea\u5206\u3092\u898b\u308b\u306e\u304b\u2026', features: ['gratitude'] },
  { id: 'mottemiteya', name: '\u30e2\u30c3\u30c8\u30df\u30c6\u30e4', quote: '\u3082\u3063\u3068\u300c\u3044\u3044\u306d\u300d\u304c\u6b32\u3057\u3044\u3060\u308d\uff1f', defeatQuote: '\u81ea\u5206\u3067\u81ea\u5206\u3092\u8a8d\u3081\u3089\u308c\u308b\u306e\u304b\u2026', features: ['gratitude'] },
  { id: 'moumuri', name: '\u30e2\u30a6\u30e0\u30ea', quote: '\u304a\u524d\u306b\u306f\u7121\u7406\u3060\u3088', defeatQuote: '\u7121\u7406\u3058\u3083\u306a\u304b\u3063\u305f\u306e\u304b\u2026\uff01', features: ['consult'] },
  { id: 'atamadekkachi', name: '\u30a2\u30bf\u30de\u30c7\u30c3\u30ab\u30c1', quote: '\u8003\u3048\u3066\u308b\u3060\u3051\u3058\u3083\u30c0\u30e1\u3060\u305e', defeatQuote: '\u884c\u52d5\u3057\u305f\u3060\u3068\u2026\u8003\u3048\u308b\u3060\u3051\u3058\u3083\u306a\u3044\u306e\u304b\u2026', features: ['review'] },
];

// ===== BATTLE SYSTEM: Enemy Data =====
const ENEMY_IMAGES: { [key: string]: any } = {
  enemy01: require('./assets/enemies/enemy01.png'),
  enemy02: require('./assets/enemies/enemy02.png'),
  enemy03: require('./assets/enemies/enemy03.png'),
  enemy04: require('./assets/enemies/enemy04.png'),
  enemy05: require('./assets/enemies/enemy05.png'),
  dragon_boss01: require('./assets/enemies/dragon_boss01.png'),
  dragon_boss02: require('./assets/enemies/dragon_boss02.png'),
  dragon_boss03: require('./assets/enemies/dragon_boss03.png'),
  dragon_boss04: require('./assets/enemies/dragon_boss04.png'),
};

const ENEMIES = [
  { id: 'enemy01', name: '風の忍', image: ENEMY_IMAGES.enemy01, minLv: 1, maxLv: 3, power: 18, isBoss: false, quote: '影に潜む者、光を恐れる' },
  { id: 'enemy02', name: '紅の侍', image: ENEMY_IMAGES.enemy02, minLv: 2, maxLv: 5, power: 30, isBoss: false, quote: '刃に迷いなし' },
  { id: 'enemy03', name: '金剛の将', image: ENEMY_IMAGES.enemy03, minLv: 3, maxLv: 7, power: 45, isBoss: false, quote: '鏧は心の壁なり' },
  { id: 'enemy04', name: '蒼穹の僧兵', image: ENEMY_IMAGES.enemy04, minLv: 4, maxLv: 8, power: 58, isBoss: false, quote: '祈りは刃よりも鋭し' },
  { id: 'enemy05', name: '黒鉄の武将', image: ENEMY_IMAGES.enemy05, minLv: 5, maxLv: 9, power: 72, isBoss: false, quote: '天下を望む者、まず己に勝て' },
  { id: 'dragon_boss01', name: '蒼龍', image: ENEMY_IMAGES.dragon_boss01, minLv: 7, maxLv: 10, power: 85, isBoss: true, quote: '龍の怒り、天を裂く' },
  { id: 'dragon_boss02', name: '紫龍', image: ENEMY_IMAGES.dragon_boss02, minLv: 7, maxLv: 10, power: 90, isBoss: true, quote: '時の果てに、我は待つ' },
  { id: 'dragon_boss03', name: '翠龍', image: ENEMY_IMAGES.dragon_boss03, minLv: 8, maxLv: 10, power: 95, isBoss: true, quote: '風は自由、されど容赦なし' },
  { id: 'dragon_boss04', name: '紅龍', image: ENEMY_IMAGES.dragon_boss04, minLv: 8, maxLv: 10, power: 100, isBoss: true, quote: '炎は全てを浄化する' },
];

const BATTLE_WIN_QUOTES = [
  '見事。だが、慢心するな。',
  'その一太刀、侍の魂を感じた。',
  '勝利は修行の証。驕ることなかれ。',
  '強くなったな。だが道はまだ続く。',
  '今日の勝利を、明日の糧とせよ。',
];

const BATTLE_LOSE_QUOTES = [
  '剣は強い。だが、心が追いついていない。',
  '敗北もまた修行。立ち上がれ。',
  '負けを恐れるな。恐れよ、学ばぬことを。',
  '今はまだ早い。修行を積め。',
  '痛みを知る者だけが、真の強さを得る。',
];

// レベル別称号
const LEVEL_TITLES: { [key: number]: string } = {
  0: '名もなき者',
  1: '無位',
  2: '見習',
  3: '足軽',
  4: '武童',
  5: '若侍',
  6: '侍',
  7: '侍将',
  8: '武将',
  9: '武神',
  10: '龍神',
};

// レベルアップに必要なXP（累計）
const LEVEL_XP_THRESHOLDS = [0, 30, 80, 150, 250, 400, 600, 900, 1300, 1700, 2500];

const SESSION_KEY = 'samurai_session_id';

// AsyncStorage Keys
const HISTORY_KEY = 'BUSHIDO_LOG_HISTORY_V1';
const DAILY_LOGS_KEY = 'BUSHIDO_DAILY_LOGS_V1';
const ONBOARDING_KEY = 'BUSHIDO_ONBOARDING_V1';
const XP_KEY = 'BUSHIDO_TOTAL_XP_V1';
const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';
const STATS_KEY = 'BUSHIDO_STATS_V1';
const KEGARE_KEY = 'BUSHIDO_KEGARE_V1';
const BLOCKLIST_KEY = 'BUSHIDO_BLOCKLIST_V1';
const SAMURAI_TIME_KEY = 'BUSHIDO_SAMURAI_TIME_V1';
const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';
const SAMURAI_MISSION_KEY = 'SAMURAI_MISSION_V1';
const FIRST_LAUNCH_KEY = 'BUSHIDO_FIRST_LAUNCH_V1';
const INTRO_SKIP_KEY = 'BUSHIDO_INTRO_SKIP_V1';
const FREE_TRIAL_DAYS = 3;

const MAX_LEVEL = 10;
const DAYS_PER_LEVEL = 3;

const DEFAULT_ROUTINES = [
  '英語勉強',
  'HIIT 10分',
  'ストレッチ',
  '呼吸 / 瞑想',
  'コールドシャワー',
  'アファメーション',
  '「ありがとう」と言われる行動をする',
  '感謝10個を書く',
  'ジャーナルを書く',
  '自然に触れる（太陽・海・風）',
];

const urgeMessage = 'その欲望、一刀両断！サムライキング参上。';

const PRIVACY_POLICY_TEXT = `
プライバシーポリシー

本プライバシーポリシーは、BUSHIDO LOG（以下「本アプリ」）において、利用者の皆さまの情報をどのように取り扱うかを定めるものです。
本アプリを利用する前に、必ずお読みください。

1. 事業者情報
・アプリ名：BUSHIDO LOG
・運営者名：HIROYA KOSHIISHI
・連絡先：oyaisyours@gmail.com

2. 取得する情報
本アプリでは、次の情報を取得する場合があります。
1. ユーザーが入力するテキスト
・日記・ログ・目標・相談内容などの文章
2. マイクから取得される音声データ
・音声入力で相談した内容
・音声は、AIによる文字起こしのために一時的にサーバーに保存される場合があります。
3. 利用ログ
・利用日時
・どのボタンを押したか など、アプリの改善のための基本的なログ
4. デバイス情報
・OSの種類やバージョン、アプリのバージョン など
※個人を特定することを目的とした情報は取得しません。

3. 情報の利用目的
取得した情報は、主に以下の目的で利用します。
1. AIコーチ機能の提供（チャット・アドバイス・読み上げ等）
2. アプリの品質向上・不具合の調査
3. 利用状況の分析による機能改善
4. 法令への遵守、安全対策のため

4. 外部サービスの利用
本アプリでは、AI機能の提供のため、以下の外部サービスを利用する場合があります。
・OpenAI, L.L.C. が提供する API（テキスト生成・音声合成・文字起こし 等）

AIに送信されるデータには、ユーザーの入力テキストや、音声を文字起こしした内容が含まれる場合があります。
外部サービスの利用にあたっては、各サービスのプライバシーポリシーも合わせてご確認ください。

5. 第三者提供
次の場合を除き、取得した情報を第三者に提供することはありません。
1. ユーザー本人の同意がある場合
2. 法令に基づき開示を求められた場合
3. 人の生命・身体・財産を守るために必要であり、本人の同意を得ることが難しい場合

6. 保存期間
利用ログやテキストデータは、アプリの継続的な利用に必要な範囲で保存します。
不要になった情報は、適切な方法で削除・匿名化します。

7. 安全管理
取得した情報については、不正アクセスや漏えい等を防ぐため、
アクセス権限の管理、通信の暗号化など、合理的な安全対策を行います。

8. 未成年の利用について
本アプリは、13歳以上の利用を想定しています。
未成年の方は、保護者の同意を得た上で利用してください。

9. プライバシーポリシーの変更
本ポリシーの内容は、必要に応じて変更されることがあります。
重要な変更がある場合は、アプリ内でお知らせします。

10. お問い合わせ窓口
本ポリシーに関するお問い合わせは、下記までご連絡ください。
・メールアドレス：oyaisyours@gmail.com
`;

const TERMS_OF_SERVICE_TEXT = `
利用規約

この利用規約（以下「本規約」）は、BUSHIDO LOG（以下「本アプリ」）の利用条件を定めるものです。本アプリをご利用いただく前に、本規約をよくお読みください。

1. 規約への同意
本アプリをダウンロード、インストール、または使用することにより、本規約に同意したものとみなされます。

2. サービス内容
本アプリは、AI技術を活用した自己成長支援サービスを提供します。サービスの内容は予告なく変更される場合があります。

3. 利用料金
・本アプリは、月額または年額のサブスクリプション形式でご利用いただけます。
・料金は、App Storeに表示される金額となります。
・サブスクリプションは、現在の期間終了の24時間前までにキャンセルしない限り、自動的に更新されます。
・購入後のキャンセル・返金は、Appleの規定に従います。

4. 禁止事項
以下の行為を禁止します：
・法令または公序良俗に違反する行為
・本アプリの不正利用やリバースエンジニアリング
・他のユーザーまたは第三者への迷惑行為
・本アプリの運営を妨害する行為

5. 免責事項
・本アプリは「現状有姿」で提供され、特定目的への適合性を保証するものではありません。
・AIによるアドバイスは参考情報であり、医療・法律・金融等の専門的助言に代わるものではありません。
・本アプリの利用により生じた損害について、当方は一切の責任を負いません。

6. 知的財産権
本アプリに含まれるコンテンツ、デザイン、ソフトウェアの著作権その他の知的財産権は、当方または正当な権利者に帰属します。

7. 規約の変更
本規約は、必要に応じて変更することがあります。重要な変更がある場合は、アプリ内でお知らせします。

8. 準拠法・管轄
本規約は日本法に準拠し、本規約に関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。

9. お問い合わせ
本規約に関するお問い合わせは、下記までご連絡ください。
・メールアドレス：oyaisyours@gmail.com
`;

// =========================
// Types
// =========================

type Message = {
  id: string;
  from: 'user' | 'king';
  text: string;
  createdAt?: string;
};

type HistoryEntry = {
  id: string;
  date: string;
  issue: string;
  reflection: string;
  reply: string;
  imageUri?: string;
};

type GoodDeedEntry = {
  id: string;
  date: string;
  text: string;
  imageUri?: string;
  tag?: string;
};

type NightReview = {
  proud: string;
  lesson: string;
  nextAction: string;
};

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

type DailyLog = {
  date: string;
  mission: string;
  routines: string[];
  todos: TodoItem[];
  review?: NightReview;
  samuraiMission?: string;
  missionCompleted?: boolean;
  routineDone?: string[];
  goodDeeds?: string[];
};

type OnboardingData = {
  identity: string;
  quit: string;
  rule: string;
};

type AppSettings = {
  autoVoice: boolean;
  readingSpeed: 'slow' | 'normal' | 'fast';
  enableHaptics: boolean;
  enableSfx: boolean;
  strictness: 'soft' | 'normal' | 'hard';
};

type SamuraiTimeState = {
  date: string;
  seconds: number;
  dailyMinutes: number; // 0 = 無制限
};

// =========================
// Defaults
// =========================

const DEFAULT_SETTINGS: AppSettings = {
  autoVoice: true,
  readingSpeed: 'normal',
  enableHaptics: true,
  enableSfx: true,
  strictness: 'normal',
};

// =========================
// Utils
// =========================

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}
function formatDateLabel(dateStr: string) {
  return dateStr.slice(5);
}
function daysDiff(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

function getStreakCount(logs: DailyLog[]): number {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...logs].sort((x, y) => x.date.localeCompare(y.date));
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const today = sorted[i].date;
    const prev = sorted[i - 1].date;
    if (daysDiff(today, prev) === 1) streak++;
    else break;
  }
  return streak;
}

function getRankFromXp(xp: number) {
  // 10段階レベルシステム
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const label = LEVEL_TITLES[level] || '名もなき者';
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const next = level >= 10 ? 0 : nextThreshold - xp;
  return { label, next, level };
}

// XPからレベル情報を取得
function getLevelFromXp(xp: number) {
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_XP_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const xpInLevel = xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const progress = level >= 10 ? 1 : xpInLevel / xpForLevel;
  return { 
    level, 
    title: LEVEL_TITLES[level] || '名もなき者',
    xp,
    xpInLevel,
    xpForLevel,
    progress,
    nextLevelXp: nextThreshold,
  };
}

function getSamuraiLevelInfo(streak: number) {
  if (streak <= 0) {
    return { level: 1, progress: 0, daysToClear: MAX_LEVEL * DAYS_PER_LEVEL };
  }
  const rawLevel = Math.floor((streak - 1) / DAYS_PER_LEVEL) + 1;
  const level = Math.min(MAX_LEVEL, Math.max(1, rawLevel));
  const currentLevelStartDay = (level - 1) * DAYS_PER_LEVEL + 1;
  const daysInThisLevel = streak - currentLevelStartDay + 1;
  const progress = Math.max(0, Math.min(1, daysInThisLevel / DAYS_PER_LEVEL));
  const totalDaysForClear = MAX_LEVEL * DAYS_PER_LEVEL;
  const daysToClear = Math.max(0, totalDaysForClear - streak);
  return { level, progress, daysToClear };
}

async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// =========================
// Audio helpers
// =========================

// マスター音量（0.0〜1.0）
const MASTER_VOLUME = 0.3;

async function playSound(source: any) {
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.setVolumeAsync(MASTER_VOLUME);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.log('sound error', e);
  }
}

async function playPressSound() {
  await playSound(STARTUP_SOUND);
}

// 各種サウンド再生
async function playTapSound() {
  await playSound(TAP_SOUND);
}

async function playConfirmSound() {
  await playSound(CONFIRM_SOUND);
}

async function playRitualSound() {
  await playSound(RITUAL_SOUND);
}

async function playCheckSound() {
  await playSound(CHECK_SOUND);
}

async function playCorrectSound() {
  await playSound(CORRECT_SOUND);
}

async function playWrongSound() {
  await playSound(WRONG_SOUND);
}

async function playLevelupSound() { await playSound(LEVELUP_SOUND); }async function playExpSound() { await playSound(EXP_SOUND); }async function playEvolutionSound() { await playSound(EVOLUTION_SOUND); }async function playWinSound() { await playSound(WIN_SOUND); }async function playFailSound() { await playSound(FAIL_SOUND); }async function playAttackSound() { await playSound(ATTACK_SOUND); }async function playEnterSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(ENTER_SOUND);
    await sound.setVolumeAsync(0.15); // 他より小さめ
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.log('enter sound error', e);
  }
}

async function playFocusStartSound() {
  await playSound(FOCUS_START_SOUND);
}

// =========================
// API
// =========================

async function callSamuraiKing(message: string): Promise<string> {
  const sessionId = await getSessionId();

  const res = await fetch(SAMURAI_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message, sessionId }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log('SamuraiKing server error body:', errorText);
    throw new Error('Server error');
  }

  const data = await res.json();
return data.reply || data.text || data.message || '（返答が空だったでござる）';
}

async function callSamuraiMissionGPT(): Promise<string> {
  const res = await fetch(SAMURAI_MISSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todayStr: getTodayStr() }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log('SamuraiMission error body:', text);
    throw new Error('Mission server error');
  }

  const data: { mission?: string; text?: string; reply?: string } = await res.json();
  return (
    data.mission ||
    data.text ||
    data.reply ||
    '今日は「スマホ時間を30分減らして、その分だけ自分の未来のために動く」でいこう。'
  );
}

// =========================
// UI: Samurai Avatar
// =========================

function SamuraiAvatar({ level, rankLabel }: { level: number; rankLabel: string }) {
  let emoji = '🥚';
  let title = `Lv.${level} 見習い侍`;
  let desc = 'まずはブシログを開き続ける段階だな。';

  if (level >= 3 && level <= 6) {
    emoji = '⚔️';
    title = `Lv.${level} 若侍`;
    desc = '習慣が少しずつ形になってきたゾーンだ。油断せず粘っていこう。';
  } else if (level >= 7 && level < MAX_LEVEL) {
    emoji = '🐉';
    title = `Lv.${level} 修羅の侍`;
    desc = 'かなりの継続力だ。周りからも変化が見え始めているはずだぞ。';
  } else if (level >= MAX_LEVEL) {
    emoji = '👑';
    title = `Lv.${level} 伝説の侍`;
    desc = '1ヶ月以上やり切った、本物のサムライだ。ここからは守りではなく拡張だな。';
  }

  return (
    <View style={styles.avatarCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarEmoji}>{emoji}</Text>
      </View>
      <View style={styles.avatarInfo}>
        <Text style={styles.avatarTitle}>{title}</Text>
        <Text style={styles.avatarRank}>ランク：{rankLabel}</Text>
        <Text style={styles.avatarDesc}>{desc}</Text>
      </View>
    </View>
  );
}

// =========================
// Main App
// =========================

export default function App() {
  const todayStr = useMemo(() => getTodayStr(), []);

  // 保存成功時のフィードバック
  // タイプライター効果
  const typeWriter = (fullText: string, msgId: string, callback?: () => void) => {
    setTypingMessageId(msgId);
    setTypingText('');
    let index = 0;
    const speed = 250; // ミリ秒/文字
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTypingMessageId(null);
        if (callback) callback();
      }
    }, speed);
  };

  const showSaveSuccess = (message: string = '一太刀入魂。保存した。') => {
    playConfirmSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaveToastMessage(message);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };
  const messagesRef = useRef<ScrollView | null>(null);

  const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character' | 'battle'>('consult');
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  
  // 感謝機能
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showGratitudeComplete, setShowGratitudeComplete] = useState(false);
  const [gratitudeAiComment, setGratitudeAiComment] = useState('');
  const [isLoadingGratitudeComment, setIsLoadingGratitudeComment] = useState(false);
  // 1日1善
  const [goodDeedList, setGoodDeedList] = useState<GoodDeedEntry[]>([]);
  const [goodDeedText, setGoodDeedText] = useState('');
  const [goodDeedImage, setGoodDeedImage] = useState<string | null>(null);
  const [goodDeedTag, setGoodDeedTag] = useState('');
  const GOOD_DEED_KEY = 'BUSHIDO_GOOD_DEED_V1';
  const GOOD_DEED_TAGS = ['掃除', '寄付', '家族', '仕事', '学び', '健康', '他者'];
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  
  // 集中機能
  const [focusPurpose, setFocusPurpose] = useState('');
  const [focusUrl, setFocusUrl] = useState('https://www.google.com');
  const [showFocusEntry, setShowFocusEntry] = useState(true);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusMinutesLeft, setFocusMinutesLeft] = useState(25);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const [focusMode, setFocusMode] = useState<'work' | 'break'>('work');
  const [focusTimerRunning, setFocusTimerRunning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com', 'youtube.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');
  
  // アラーム機能
  const [showDojoGate, setShowDojoGate] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [introSkipped, setIntroSkipped] = useState(false);
  const [skipIntroNext, setSkipIntroNext] = useState(false);
  const [gatePhase, setGatePhase] = useState<'dim' | 'light' | 'button'>('dim');
  const dimOpacity = useRef(new Animated.Value(1)).current;
  const lightOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  
  // 道場の門アニメーション
  useEffect(() => {
    if (showDojoGate) {
      // 0.8秒後に暗い門→明るい門へクロスフェード
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(dimOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(lightOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start(() => {
          setGatePhase('light');
          // 200ms待ってからボタンをフェードイン
          setTimeout(() => {
            setGatePhase('button');
            Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
          }, 200);
        });
      }, 100);
    }
  }, [showDojoGate]);
  
  // Introスキップ設定を読み込み
  useEffect(() => {
    (async () => {
      const skipped = await AsyncStorage.getItem(INTRO_SKIP_KEY);
      setIntroSkipped(skipped === 'true');
    })();
  }, []);

  // RevenueCat初期化とPro状態チェック
  useEffect(() => {
    (async () => {
      try {
        await initializePurchases();
        const proStatus = await checkProStatus();
        // setIsPro(proStatus); // TEST
        const monthly = await getMonthlyPrice();
        const annual = await getAnnualPrice();
        setMonthlyPrice(monthly);
        setAnnualPrice(annual);
      } catch (e) {
        console.log('RevenueCat init error', e);
      }
    })();
  }, []);
  
  // 通知の権限リクエスト
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
      }
    })();
  }, []);

  // 通知タップ時のハンドラー
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'wakeup_alarm') {
        // 起床アラームの通知タップ → アラームタブへ移動して鳴らす
        setTab('alarm');
        setAlarmRinging(true);
      } else if (data?.type === 'mission_deadline') {
        // ミッション期限通知タップ → アラーム画面表示
        setMissionStatus('expired');
        setMissionAlarmActive(true);
        setShowMissionAlarm(true);
      }
    });
    return () => subscription.remove();
  }, []);
  
  // 道場の門を閉じる（刀音付き）
  const handleEnterDojo = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(KATANA_SOUND);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('katana sound error', e);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // 150ms後に遷移
    setTimeout(async () => {
      setShowDojoGate(false);
      // 穢れチェック
      await checkKegare();
      // Introをスキップしていなければ表示
      if (!introSkipped) {
        setShowIntro(true);
      }
    }, 150);
  };
  
  // Introを閉じてホームへ
  const handleCloseIntro = async () => {
    // 動画を一度見たら次回からスキップ
    await AsyncStorage.setItem(INTRO_SKIP_KEY, 'true');
    setIntroSkipped(true);
    setVideoFinished(false);
    setShowIntro(false);
  };
  
  // Introを再表示（設定から）
  const resetIntroSkip = async () => {
    await AsyncStorage.removeItem(INTRO_SKIP_KEY);
    setIntroSkipped(false);
    Alert.alert('完了', '次回起動時にIntroが表示されます');
  };
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmMission, setAlarmMission] = useState<'冷蔵庫' | '洗面台' | '玄関'>('洗面台');
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [alarmLevel, setAlarmLevel] = useState(1);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [alarmNotificationId, setAlarmNotificationId] = useState<string | null>(null);
  const [missionNotificationId, setMissionNotificationId] = useState<string | null>(null);
  
  const alarmMessages = {
    1: [
      '素晴らしい朝だ。今日という日は二度と来ない。',
      '今日はお前の人生で最高の日になる。',
      '新しい朝だ。昨日の自分を超えるチャンスだ。',
      '今日はお前にしかできない何かがある。',
    ],
    2: [
      '今日という贈り物を受け取れ。',
      '今日を最高の一日にしよう。',
      '布団から出れば、素晴らしい世界が待っている。',
      'お前には無限の可能性がある。',
    ],
    3: [
      'さあ、そろそろ起きる時間だ。',
      '今日という日が待っているぞ。',
      'あと少しの勇気だ。立ち上がれ。',
      'お前ならできる。さあ、起きよう。',
    ],
    4: [
      'おい。そろそろ起きろ。',
      'いつまで寝ている？',
      '甘えるな。起きろ。',
      'もう時間だ。',
    ],
    5: [
      'おい！そろそろ起きろ！', 
      '何をしている！起きろ！',
      '立て！今すぐ！',
      'いつまで甘えている！',
    ],
    6: [
      '起きろ！', 
      '行動！', 
      '立て！', 
      'いい加減起きろ！',
      '最高の日にしろ！',
      '誰かが生きたかった今日だぞ！',
      'お前ならできる！',
      '今日を無駄にするな！',
      'さあ立て！',
    ],
  };
  
  const alarmStartTimeRef = useRef<number>(0);
  
  const scheduleNextShout = () => {
    const elapsedSec = (Date.now() - alarmStartTimeRef.current) / 1000;
    let level = 1;
    let interval = 12000;
    
    if (elapsedSec > 180) {
      level = 6; interval = 2500;  // 3分以上：くるってくる
    } else if (elapsedSec > 150) {
      level = 6; interval = 4000;
    } else if (elapsedSec > 120) {
      level = 5; interval = 6000;
    } else if (elapsedSec > 90) {
      level = 4; interval = 8000;
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000;
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000;
    }
    
    const displayLevel = level <= 3 ? 1 : Math.min(level - 2, 4);
    setAlarmLevel(displayLevel);
    
    const msgs = alarmMessages[level as 1|2|3|4|5|6];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    let fullMsg = msg;
    if (level <= 3) {
      fullMsg += ' ' + alarmMission + 'を撮影して最高の一日を始めよう。';
    } else if (level === 4) {
      fullMsg += ' ' + alarmMission + 'を撮れ。';
    } else if (level === 5) {
      fullMsg += ' 今すぐ' + alarmMission + '撮影しろ！';
    } else {
      fullMsg += ' ' + alarmMission + '撮れ！！今すぐ！！';
    }
    
    speakSamurai(fullMsg);
    if (level >= 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, interval);
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    
    speakSamurai('おはよう！今日という日は、お前の人生で最も素晴らしい日になる。さあ、' + alarmMission + 'を撮影して、最高の一日を始めよう！');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, 12000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearTimeout(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarmRinging(false);
    setAlarmSet(false);
    speakSamurai('よくやった。今日も己に勝て。武士道とは毎朝の勝利から始まる。');
  };
  
  const takeMissionPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラ許可が必要', 'アラームを止めるにはカメラを許可してください');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    
    if (!result.canceled) {
      stopAlarm();
      setShowStartScreen(true);
    }
  };
  const [focusDuration, setFocusDuration] = useState(25);
  const [ngWords, setNgWords] = useState<string[]>(['エロ', 'アダルト', 'porn', 'sex', 'ギャンブル', 'カジノ', 'パチンコ']);
  const [newNgWord, setNewNgWord] = useState('');
  const [ngLevel, setNgLevel] = useState<3 | 5 | 10>(5);
  const [showNgQuiz, setShowNgQuiz] = useState(false);
  const [ngQuizRemaining, setNgQuizRemaining] = useState(0);
  const [pendingUrl, setPendingUrl] = useState('');
  const [currentNgQ, setCurrentNgQ] = useState({ q: '', a: '' });
  const [ngAnswer, setNgAnswer] = useState('');
  const [focusQuestionAnswer, setFocusQuestionAnswer] = useState('');
  const [showFocusQuestion, setShowFocusQuestion] = useState(false);
  const [currentFocusQ, setCurrentFocusQ] = useState({ q: '', a: '' });

  // 英語の問題（摩擦を生む）
  const focusQuestions = [
    { q: 'What is the opposite of "success"?', a: 'failure' },
    { q: 'What is the past tense of "go"?', a: 'went' },
    { q: 'What is the capital of Japan?', a: 'tokyo' },
    { q: 'How do you say "時間" in English?', a: 'time' },
    { q: 'What is 7 x 8?', a: '56' },
    { q: 'What is the opposite of "hot"?', a: 'cold' },
    { q: 'How many days in a week?', a: '7' },
    { q: 'What color is the sky?', a: 'blue' },
    { q: 'What is the plural of "child"?', a: 'children' },
    { q: 'What comes after Wednesday?', a: 'thursday' },
  ];
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // 自己啓発クイズデータ
  const quizData = [
    { q: '「継続は___なり」', a: '力', hint: '続けることで得られるもの' },
    { q: '「思考は___化する」', a: '現実', hint: '考えたことがなるもの' },
    { q: '「行動なき___に価値なし」', a: '知識', hint: '学んだだけでは意味がないもの' },
    { q: '「今日できることを___に延ばすな」', a: '明日', hint: '今日の次の日' },
    { q: '「失敗は___の母」', a: '成功', hint: '失敗から生まれるもの' },
    { q: '「千里の道も___から」', a: '一歩', hint: '最初の小さな行動' },
    { q: '「時は___なり」', a: '金', hint: 'お金と同じくらい大切' },
    { q: '「七転び___起き」', a: '八', hint: '7+1' },
    { q: '「早起きは三文の___」', a: '徳', hint: '良いこと' },
    { q: '「塵も積もれば___となる」', a: '山', hint: '高いもの' },
  ];

  // onboarding
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [obIdentity, setObIdentity] = useState('');
  const [obQuit, setObQuit] = useState('');
  const [obRule, setObRule] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(1); // 新オンボーディング: 1-4
  const [userStartChoice, setUserStartChoice] = useState<'free' | 'serious' | null>(null);

  // settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  // 課金関連
  const [isPro, setIsPro] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState('¥700');
  const [annualPrice, setAnnualPrice] = useState('¥7,000');
  const [samuraiKingUses, setSamuraiKingUses] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // chat
  const [isSummoned, setIsSummoned] = useState(false);
  // 欲望可視化モード
  const [consultMode, setConsultMode] = useState<'select' | 'text' | 'visualize'>('select');
  const [yokubouImage, setYokubouImage] = useState<string | null>(null);
  const [yokubouReason, setYokubouReason] = useState('');
  const [yokubouAiReply, setYokubouAiReply] = useState('');
  const [isLoadingYokubou, setIsLoadingYokubou] = useState(false);
  const [yokubouSaved, setYokubouSaved] = useState(false);
  const [mode, setMode] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'first', from: 'king', text: 'おいおいどうした？その欲望を断ち切るぞ。' },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // daily logs
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // edit existing review
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editProud, setEditProud] = useState('');
  const [editLesson, setEditLesson] = useState('');
  const [editNextAction, setEditNextAction] = useState('');

  // goal tab inputs
  const [missionInput, setMissionInput] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [todoInput, setTodoInput] = useState('');

  // review tab inputs
  const [proudInput, setProudInput] = useState('');
  const [lessonInput, setLessonInput] = useState('');
  const [nextActionInput, setNextActionInput] = useState('');

  // samurai mission
  const [samuraiMissionText, setSamuraiMissionText] = useState('');
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [missionCompletedToday, setMissionCompletedToday] = useState(false);
  
  // サムライミッション（Lv2機能）
  type MissionStatus = 'none' | 'offered' | 'accepted' | 'started' | 'completed' | 'expired' | 'amnesty';
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('none');
  const [missionSource, setMissionSource] = useState<'ai' | 'self'>('ai');
  const [missionAcceptedAt, setMissionAcceptedAt] = useState<number | null>(null);
  const [missionDeadlineAt, setMissionDeadlineAt] = useState<number | null>(null);
  const [missionStarted, setMissionStarted] = useState(false);
  const [dailyMissionUsed, setDailyMissionUsed] = useState(false);
  const [amnestyUsedToday, setAmnestyUsedToday] = useState(false);
  const [missionAlarmActive, setMissionAlarmActive] = useState(false);
  const [missionDeadlineMinutes, setMissionDeadlineMinutes] = useState(10);
  
  // ミッションアラーム解除用
  const [showMissionAlarm, setShowMissionAlarm] = useState(false);
  const [missionQuizCorrectStreak, setMissionQuizCorrectStreak] = useState(0);
  const [missionQuizQuestion, setMissionQuizQuestion] = useState({ q: '', a: '' });
  const [missionQuizAnswer, setMissionQuizAnswer] = useState('');
  const [missionQuizTimeLeft, setMissionQuizTimeLeft] = useState(10);
  const [showAlternativeAction, setShowAlternativeAction] = useState(false);
  const [alternativeAction, setAlternativeAction] = useState('');
  
  // 相談からのミッション提案
  const [showMissionProposal, setShowMissionProposal] = useState(false);
  const [proposedMission, setProposedMission] = useState('');
  const [lastConsultText, setLastConsultText] = useState(''); // 最後の相談内容
  const [lastConsultReply, setLastConsultReply] = useState(''); // 最後の返答
  const [canCreateMission, setCanCreateMission] = useState(false); // ミッション生成可能か
  const [isGeneratingMissionFromConsult, setIsGeneratingMissionFromConsult] = useState(false);

  // XP
  const [totalXp, setTotalXp] = useState(0);

  // ===== Battle System State =====
  const [battleMode, setBattleMode] = useState<'select' | 'fighting' | 'result' | null>(null);
  const [battleEnemy, setBattleEnemy] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [battleWinStreak, setBattleWinStreak] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleTurnLog, setBattleTurnLog] = useState<string[]>([]);
  const [battleAnimating, setBattleAnimating] = useState(false);
  const [battleQuote, setBattleQuote] = useState('');
  const [battleXpGained, setBattleXpGained] = useState(0);
  const battleShakeAnim = useRef(new Animated.Value(0)).current;
  const playerShakeAnim = useRef(new Animated.Value(0)).current;

  // ===== Kegare (Katana Polishing) System =====
  const [showKatanaPolish, setShowKatanaPolish] = useState(false);
  const [polishCount, setPolishCount] = useState(0);
  const [polishRequired, setPolishRequired] = useState(5);
  const [polishComplete, setPolishComplete] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [kegareQuote, setKegareQuote] = useState('');
  const katanaGlowAnim = useRef(new Animated.Value(0)).current;
  const katanaScaleAnim = useRef(new Animated.Value(1)).current;

  // ===== Yokai Defeat System =====
  const [yokaiEncounter, setYokaiEncounter] = useState<YokaiData | null>(null);
  const [yokaiPhase, setYokaiPhase] = useState<'appear' | 'attack' | 'defeated' | null>(null);
  const [yokaiXp, setYokaiXp] = useState(0);
  const [yokaiFeature, setYokaiFeature] = useState<string>('');
  const yokaiShakeAnim = useRef(new Animated.Value(0)).current;


  // ===== Stats System =====
  const [samuraiStats, setSamuraiStats] = useState<{power: number, mind: number, skill: number, virtue: number}>({power: 75, mind: 75, skill: 75, virtue: 75});
  const [statsAllocated, setStatsAllocated] = useState(false);
  const [showStatsAlloc, setShowStatsAlloc] = useState(false);
  const [tempStats, setTempStats] = useState({power: 75, mind: 75, skill: 75, virtue: 75});
  const [lastRealloc, setLastRealloc] = useState<string | null>(null);
  const [showReallocModal, setShowReallocModal] = useState(false);
  const [reallocBudget] = useState(30);


  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const logoGlowAnim = useRef(new Animated.Value(0)).current;

  // browser
  const [browserUrl, setBrowserUrl] = useState('https://google.com');
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [blocklistInput, setBlocklistInput] = useState('');

  // samurai time
  const [samuraiTime, setSamuraiTime] = useState<SamuraiTimeState>({
    date: todayStr,
    seconds: 0,
    dailyMinutes: 60,
  });

  const isTimeLimited = samuraiTime.dailyMinutes > 0;
  const maxSeconds = samuraiTime.dailyMinutes * 60;
  const isTimeOver = isTimeLimited && samuraiTime.seconds >= maxSeconds;
  const usedMinutes = Math.floor(samuraiTime.seconds / 60);
  const remainingMinutes = isTimeLimited ? Math.max(0, samuraiTime.dailyMinutes - usedMinutes) : null;

  // =========================
  // Startup sound
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(STARTUP_SOUND);
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
        });
      } catch (e) {
        console.log('start sound error', e);
      }
    })();
  }, []);

  // =========================
  // Keyboard watcher
  // =========================
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // =========================
  // Loaders
  // =========================

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      const logs: HistoryEntry[] = json ? JSON.parse(json) : [];
      setHistory(Array.isArray(logs) ? logs : []);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(DAILY_LOGS_KEY);
        const logs: DailyLog[] = json ? JSON.parse(json) : [];
        setDailyLogs(Array.isArray(logs) ? logs : []);
      } catch (e) {
        console.error('Failed to load daily logs', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (json) {
          const data = JSON.parse(json);
          // 新フォーマット: { completed: true, choice: 'free' | 'serious' }
          // 旧フォーマット: OnboardingData { identity, quit, rule }
          if (data.completed) {
            // 新フォーマット
            setUserStartChoice(data.choice || 'free');
            setIsOnboarding(false);
          } else if (data.identity !== undefined) {
            // 旧フォーマット（既存ユーザー対応）
            setOnboardingData(data);
            setObIdentity(data.identity ?? '');
            setObQuit(data.quit ?? '');
            setObRule(data.rule ?? '');
            setIsOnboarding(false);
          } else {
            setIsOnboarding(true);
          }
        } else {
          setIsOnboarding(true);
        }
      } catch (e) {
        console.error('Failed to load onboarding', e);
      } finally {
        setIsLoadingOnboarding(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(XP_KEY);
        if (saved) {
          const num = Number(saved);
          if (!Number.isNaN(num)) setTotalXp(num);
        }
        // Load stats
        const statsJson = await AsyncStorage.getItem(STATS_KEY);
        if (statsJson) {
          const parsed = JSON.parse(statsJson);
          setSamuraiStats(parsed.stats || {power: 75, mind: 75, skill: 75, virtue: 75});
          setStatsAllocated(parsed.allocated || false);
          setLastRealloc(parsed.lastRealloc || null);
        }
      } catch (e) {
        console.error('Failed to load XP', e);
      }
    })();
  }, []);

  // ロゴの光るアニメーション（Lv1以上で常時）
  useEffect(() => {
    const level = getLevelFromXp(totalXp).level;
    if (level >= 1) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(logoGlowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [totalXp]);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SETTINGS_KEY);
        if (json) {
          const parsed: AppSettings = JSON.parse(json);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    })();
  }, []);

  // samuraiKingUsesを読み込み（初回無料体験の管理）
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_KING_USES_KEY);
        if (json) {
          const data = JSON.parse(json);
          const today = new Date().toISOString().split('T')[0];
          if (data.date === today) {
            setSamuraiKingUses(data.count);
          } else {
            setSamuraiKingUses(0);
          }
        }
      } catch (e) {
        console.error('Failed to load samuraiKingUses', e);
      }
    })();
  }, []);

  // サムライミッションの読み込みと日付リセット
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_MISSION_KEY);
        const today = new Date().toISOString().split('T')[0];
        if (json) {
          const data = JSON.parse(json);
          if (data.date !== today) {
            console.log('Mission: New day, resetting...');
            setMissionStatus('none');
            setDailyMissionUsed(false);
            setAmnestyUsedToday(false);
            setMissionStarted(false);
            setMissionAlarmActive(false);
            setSamuraiMissionText('');
            setMissionAcceptedAt(null);
            setMissionDeadlineAt(null);
          } else {
            setSamuraiMissionText(data.missionText || '');
            setMissionStatus(data.status || 'none');
            setMissionSource(data.source || 'ai');
            setMissionAcceptedAt(data.acceptedAt || null);
            setMissionDeadlineAt(data.deadlineAt || null);
            setMissionStarted(data.started || false);
            setDailyMissionUsed(data.dailyUsed || false);
            setAmnestyUsedToday(data.amnestyUsed || false);
            setMissionAlarmActive(data.alarmActive || false);
            console.log('Mission: Restored state:', data.status);
          }
        }
      } catch (e) {
        console.error('Failed to load mission', e);
      }
    })();
  }, []);

  // ミッションデータを保存する関数
  const saveMissionState = async (updates: Partial<{
    missionText: string;
    status: MissionStatus;
    source: 'ai' | 'self';
    acceptedAt: number | null;
    deadlineAt: number | null;
    started: boolean;
    dailyUsed: boolean;
    amnestyUsed: boolean;
    alarmActive: boolean;
  }>) => {
    const today = new Date().toISOString().split('T')[0];
    const current = {
      date: today,
      missionText: updates.missionText ?? samuraiMissionText,
      status: updates.status ?? missionStatus,
      source: updates.source ?? missionSource,
      acceptedAt: updates.acceptedAt ?? missionAcceptedAt,
      deadlineAt: updates.deadlineAt ?? missionDeadlineAt,
      started: updates.started ?? missionStarted,
      dailyUsed: updates.dailyUsed ?? dailyMissionUsed,
      amnestyUsed: updates.amnestyUsed ?? amnestyUsedToday,
      alarmActive: updates.alarmActive ?? missionAlarmActive,
    };
    await AsyncStorage.setItem(SAMURAI_MISSION_KEY, JSON.stringify(current));
  };

  // ミッションタイマー監視
  useEffect(() => {
    if (missionStatus !== 'accepted' || !missionDeadlineAt) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now > missionDeadlineAt && !missionStarted) {
        console.log('Mission: Deadline exceeded, alarm triggered!');
        setMissionStatus('expired');
        setMissionAlarmActive(true);
        setShowMissionAlarm(true);
        saveMissionState({ status: 'expired', alarmActive: true });
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [missionStatus, missionDeadlineAt, missionStarted]);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(BLOCKLIST_KEY);
        if (json) {
          const arr = JSON.parse(json);
          if (Array.isArray(arr)) setBlockedDomains(arr);
        }
      } catch (e) {
        console.error('Failed to load blocklist', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_TIME_KEY);
        if (json) {
          const parsed = JSON.parse(json) as SamuraiTimeState;
          if (
            parsed &&
            typeof parsed.dailyMinutes === 'number' &&
            typeof parsed.seconds === 'number' &&
            typeof parsed.date === 'string'
          ) {
            const today = getTodayStr();
            if (parsed.date !== today) {
              setSamuraiTime({ date: today, seconds: 0, dailyMinutes: parsed.dailyMinutes });
            } else {
              setSamuraiTime(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load samurai time', e);
      }
    })();
  }, []);

  // =========================
  // Tab change sync (Goal/Review)
  // =========================
  useEffect(() => {
    const todayLog = dailyLogs.find(l => l.date === getTodayStr());

    if (tab === 'goal') {
      setMissionInput(todayLog?.mission ?? '');
      setRoutineText(todayLog?.routines?.join('\n') ?? '');
      setTodoInput(todayLog?.todos?.map(t => t.text).join('\n') ?? '');
      setSamuraiMissionText(todayLog?.samuraiMission ?? '');
      setMissionCompletedToday(todayLog?.missionCompleted ?? false);
    }

    if (tab === 'review') {
      const targetDate = selectedDate || (todayLog ? todayLog.date : undefined);
      const targetLog = targetDate ? dailyLogs.find(l => l.date === targetDate) : undefined;

      setProudInput(targetLog?.review?.proud ?? '');
      setLessonInput(targetLog?.review?.lesson ?? '');
      setNextActionInput(targetLog?.review?.nextAction ?? '');

      if (!selectedDate && todayLog) setSelectedDate(todayLog.date);
    }
  }, [tab, dailyLogs, selectedDate]);

  // =========================
  // Auto scroll chat
  // =========================
  useEffect(() => {
    if (mode !== 'chat') return;
    setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, mode, isKeyboardVisible]);

  // =========================
  // Samurai time ticker
  // =========================
  useEffect(() => {
    if (isOnboarding) return;
    if (!samuraiTime.dailyMinutes || samuraiTime.dailyMinutes <= 0) return;

    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled) return;

      setSamuraiTime(prev => {
        const today = getTodayStr();
        let base = prev;

        if (prev.date !== today) {
          base = { ...prev, date: today, seconds: 0 };
        }

        const maxSec = base.dailyMinutes * 60;
        if (base.seconds >= maxSec) return base;

        const updated: SamuraiTimeState = { ...base, seconds: base.seconds + 1 };
        AsyncStorage.setItem(SAMURAI_TIME_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnboarding, samuraiTime.dailyMinutes]);

  // =========================
  // Settings save
  // =========================
  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const updateSamuraiDailyMinutes = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const num = parseInt(numeric, 10);
    const minutes = Number.isNaN(num) ? 0 : Math.max(0, Math.min(600, num)); // max 10h

    setSamuraiTime(prev => {
      const next: SamuraiTimeState = { ...prev, dailyMinutes: minutes };
      AsyncStorage.setItem(SAMURAI_TIME_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // =========================
  // Storage helpers: daily logs
  // =========================
  const saveDailyLogsToStorage = async (logs: DailyLog[]) => {
    try {
      await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
      markMissionStarted(); // サムライミッション開始判定
    } catch (e) {
      console.error('Failed to save daily logs', e);
    }
  };

  const upsertLogForDate = async (date: string, updater: (prev: DailyLog | undefined) => DailyLog) => {
    const prev = dailyLogs.find(l => l.date === date);
    const updated = updater(prev);
    const others = dailyLogs.filter(l => l.date !== date);
    const newLogs = [...others, updated].sort((a, b) => a.date.localeCompare(b.date));
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const upsertTodayLog = async (updater: (prev: DailyLog | undefined) => DailyLog) => {
    return upsertLogForDate(getTodayStr(), updater);
  };

  // =========================
  // TTS (server audio)
  // =========================
  const speakSamurai = async (text: string) => {
    if (!text || !settings.autoVoice) return;

    const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('[TTS] error', e);
    }
  };

  // =========================
  // Haptics/SFX wrappers
  // =========================
  const tap = async (type: 'light' | 'medium' | 'select' | 'success' = 'select') => {
    if (!settings.enableHaptics && !settings.enableSfx) return;

    if (settings.enableHaptics) {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (type === 'select') Haptics.selectionAsync().catch(() => {});
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (settings.enableSfx) await playTapSound();
  };

  // =========================
  // Chat actions
  // =========================
  const handleUrgePress = async () => {
    setIsSummoned(true);
    await tap('medium');
    speakSamurai(urgeMessage);
  };

  // 欲望可視化: 画像選択
  const pickYokubouImage = async () => {
    playTapSound();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setYokubouImage(result.assets[0].uri);
      setYokubouAiReply('');
      setYokubouSaved(false);
    }
  };

  // 欲望可視化: カメラ撮影
  const takeYokubouPhoto = async () => {
    playTapSound();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('カメラの許可が必要です', 'カメラを使うには設定から許可してください。');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setYokubouImage(result.assets[0].uri);
      setYokubouAiReply('');
      setYokubouSaved(false);
    }
  };

  // 欲望可視化: AI送信
  const handleYokubouSubmit = async () => {
    if (!yokubouImage || !yokubouReason.trim()) return;
    playTapSound();
    setIsLoadingYokubou(true);
    try {
      // 欲望可視化専用のプロンプト
      const yokubouPrompt = `ユーザーが「今やりたいこと」の写真を撮り、その理由を書きました。

ユーザーの理由：「${yokubouReason}」

あなたはサムライキングとして、ユーザーの言葉を深く理解した上で返答してください。
- ユーザーが書いた内容に具体的に触れること
- 説教や否定ではなく、気づきを与える一言
- 最大2〜3文で短く
- 最後は考えさせる問いかけで締める
- もし前向きな行動（勉強、運動、仕事など）なら応援する`;

      const res = await fetch(SAMURAI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: yokubouPrompt,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'その行動、本当に今のお前に必要か？';
      setYokubouAiReply(reply);
      if (settings.autoVoice) speakSamurai(reply);
    } catch {
      setYokubouAiReply('立ち止まれ。呼吸しろ。今じゃない。');
    }
    setIsLoadingYokubou(false);
  };

  // 欲望可視化: 保存
  const handleYokubouSave = async () => {
    if (!yokubouImage || !yokubouAiReply) return;
    playTapSound();
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      issue: '[欲望可視化] ' + yokubouReason,
      reflection: '',
      reply: yokubouAiReply,
      imageUri: yokubouImage,
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setYokubouSaved(true);
    showSaveSuccess('止まれ。呼吸しろ。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 欲望可視化: リセット
  const resetYokubou = () => {
    playTapSound();
    setYokubouImage(null);
    setYokubouReason('');
    setYokubouAiReply('');
    setYokubouSaved(false);
  };

  const handleSend = async () => {
    // 課金チェック: Proでない場合、2回目以降はPaywall表示
    if (!isPro && samuraiKingUses >= 1) {
      setShowPaywall(true);
      return;
    }
    if (!input.trim() || isSending) return;

    await tap('select');

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    const userMsg: Message = {
      id: `${Date.now()}`,
      from: 'user',
      text: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const replyText = await callSamuraiKing(userText);

      const msgId = `${Date.now()}-samurai`;
      const kingMsg: Message = {
        id: msgId,
        from: 'king',
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      typeWriter(replyText, msgId);

      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        issue: userText,
        reflection: '',
        reply: replyText,
      };
      const updatedHistory = [...history, entry];
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      // 使用回数カウントアップ（Pro以外）
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        const newUses = samuraiKingUses + 1;
        setSamuraiKingUses(newUses);
        await AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: newUses }));
      }
      
      // 相談内容を保持（ミッション生成用）- 自動提案はしない
      console.log("Mission button check:", { isPro, dailyMissionUsed, missionStatus }); if (isPro && !dailyMissionUsed && missionStatus === 'none') {
        setLastConsultText(userText);
        setLastConsultReply(replyText);
        setCanCreateMission(true);
      }
    } catch (error) {
      console.log('SamuraiKing error', error);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          from: 'king',
          text: 'ネットワークエラーでござる。もう一度試してほしいでござる。',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSwitchToChat = async () => {
    await tap('select');
    setMode('chat');
  };

  const handleSwitchToHistory = async () => {
    await tap('select');
    setMode('history');
    await loadHistory();
  };

  // =========================
  // サムライミッション機能
  // =========================

  // クイズ問題を生成
  const generateMissionQuiz = () => {
    const quizTypes = ['add', 'multiply', 'sequence'];
    const type = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    
    if (type === 'add') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      return { q: `${a} + ${b} = ?`, a: String(a + b) };
    } else if (type === 'multiply') {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      return { q: `${a} × ${b} = ?`, a: String(a * b) };
    } else {
      const start = Math.floor(Math.random() * 5) + 1;
      const diff = Math.floor(Math.random() * 3) + 2;
      const seq = [start, start + diff, start + diff * 2];
      return { q: `${seq.join(', ')}, ? (次の数)`, a: String(start + diff * 3) };
    }
  };

  // 代替行動を生成
  const generateAlternativeAction = () => {
    const actions = [
      '立って深呼吸を5回する',
      '冷たい水で顔を洗う',
      '今日の最重要タスクを1行で書く',
      '立ったまま30秒間目を閉じる',
      '窓を開けて外の空気を吸う',
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  // 相談内容からミッションを生成
  const generateMissionFromConsult = async () => {
    if (!lastConsultReply || isGeneratingMissionFromConsult) return;
    
    setIsGeneratingMissionFromConsult(true);
    
    try {
      // サムライキングの返答からミッションを抽出するプロンプト
      const missionPrompt = `【ミッション抽出依頼】
以下はサムライキングがユーザーに提案した返答です。
この返答から「具体的な行動」を1つだけ抽出してミッション形式にしてください。

サムライキングの返答：
「${lastConsultReply}」

ルール：
- 返答に含まれる行動をそのまま使う（勝手に変えない）
- 時間・場所・回数が明記されていればそのまま含める
- 明記されていなければ最低限だけ補足
- 1〜2文で簡潔に

出力形式：
ミッション内容のみ。説明や前置きは不要。`;

      const missionText = await callSamuraiKing(missionPrompt);
      
      // 余計な前置きを削除
      const cleanMission = missionText
        .replace(/^(ミッション[：:]\s*|では[、,]\s*|よし[、,]\s*|了解[、,]\s*)/i, '')
        .trim();
      
      setProposedMission(cleanMission);
      setShowMissionProposal(true);
      setCanCreateMission(false);
      
    } catch (error) {
      console.error('Mission generation error:', error);
      Alert.alert('エラー', 'ミッション生成に失敗しました');
    } finally {
      setIsGeneratingMissionFromConsult(false);
    }
  };

  // 相談からのミッション提案を受諾
  const acceptProposedMission = async () => {
    setShowMissionProposal(false);
    
    // ミッションを設定
    setSamuraiMissionText(proposedMission);
    setMissionSource('ai');
    setMissionStatus('offered');
    
    await saveMissionState({
      missionText: proposedMission,
      source: 'ai',
      status: 'offered',
    });
    
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // トーストで表示（チャットに流さない）
    showSaveSuccess('契約成立！目標タブで期限を設定せよ');
    
    // 目標タブに自動移動
    setTimeout(() => setTab('goal'), 500);
  };

  // 相談からのミッション提案を拒否
  const rejectProposedMission = () => {
    setShowMissionProposal(false);
    
    playWrongSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // トーストで表示（チャットに流さない）
    const angryMessages = [
      '今回は逃げたな…だが次がある',
      '臆病者め…次は逃げるなよ',
      'やらぬか。まあいい、お前の人生だ',
    ];
    const angryMsg = angryMessages[Math.floor(Math.random() * angryMessages.length)];
    showSaveSuccess(angryMsg);
  };

  // ミッション受諾
  const acceptMission = async () => {
    if (dailyMissionUsed) {
      Alert.alert('今日のミッションは終了', '明日また挑戦しよう！');
      return;
    }
    
    const now = Date.now();
    const deadline = now + missionDeadlineMinutes * 60 * 1000;
    
    setMissionStatus('accepted');
    setMissionAcceptedAt(now);
    setMissionDeadlineAt(deadline);
    setDailyMissionUsed(true);
    setMissionStarted(false);
    
    await saveMissionState({
      status: 'accepted',
      acceptedAt: now,
      deadlineAt: deadline,
      dailyUsed: true,
      started: false,
    });
    
    // 期限切れ通知をスケジュール
    if (missionNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
    }
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ ミッション期限切れ',
        body: '逃げたな？アプリを開いてアラームを解除せよ！',
        sound: true,
        data: { type: 'mission_deadline' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(deadline),
      },
    });
    setMissionNotificationId(notifId);
    
    playTapSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('契約成立！', `${missionDeadlineMinutes}分以内に行動を開始せよ`);
    console.log('Mission: Accepted, deadline:', new Date(deadline).toLocaleTimeString());
  };

  // ミッション開始を記録
  const markMissionStarted = async () => {
    if (missionStatus === 'accepted' && !missionStarted) {
      console.log('Mission: Started!');
      setMissionStarted(true);
      setMissionStatus('started');
      await saveMissionState({ started: true, status: 'started' });
      
      // 期限通知をキャンセル（開始したので不要）
      if (missionNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
        setMissionNotificationId(null);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // XP付与とレベルアップチェック
  const addXpWithLevelCheck = async (xpGain: number) => {
    const oldLevel = getLevelFromXp(totalXp).level;
    const newXp = totalXp + xpGain;
    const newLevel = getLevelFromXp(newXp).level;
    
    setTotalXp(newXp);
    await AsyncStorage.setItem(XP_KEY, String(newXp));
    
    // レベルアップした場合
    if (newLevel > oldLevel) {
      setLevelUpInfo({ oldLevel, newLevel });
      playLevelupSound(); setTimeout(() => setShowLevelUpModal(true), 500);
    }
    
    return newXp;
  };

  // ミッション完了
  const completeMission = async () => {
    if (missionStatus === 'started' || missionStatus === 'accepted') {
      console.log('Mission: Completed!');
      setMissionStatus('completed');
      setMissionCompletedToday(true);
      await saveMissionState({ status: 'completed' });
      
      // 期限通知をキャンセル
      if (missionNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
        setMissionNotificationId(null);
      }
      
      const xpGain = 50;
      await addXpWithLevelCheck(xpGain);
      
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSaveSuccess(`修行達成！+${xpGain} XP`);
      triggerYokaiDefeat('consult', 0);
    }
  };

  // クイズ解答チェック
  const checkMissionQuizAnswer = () => {
    if (missionQuizAnswer.trim() === missionQuizQuestion.a) {
      const newStreak = missionQuizCorrectStreak + 1;
      setMissionQuizCorrectStreak(newStreak);
      playCorrectSound();
      
      if (newStreak >= 3) {
        setMissionAlarmActive(false);
        setShowMissionAlarm(false);
        setMissionQuizCorrectStreak(0);
        saveMissionState({ alarmActive: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSaveSuccess('アラーム解除！今日も頑張ろう');
        triggerYokaiDefeat('alarm', 25);
      } else {
        setMissionQuizQuestion(generateMissionQuiz());
        setMissionQuizAnswer('');
        setMissionQuizTimeLeft(10);
      }
    } else {
      playWrongSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMissionQuizCorrectStreak(0);
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizTimeLeft(10);
    }
  };

  // カメラでアラーム解除
  const dismissAlarmWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラ権限が必要です');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setMissionAlarmActive(false);
      setShowMissionAlarm(false);
      saveMissionState({ alarmActive: false });
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSaveSuccess('アラーム解除！今日も頑張ろう');
    }
  };

  // 恩赦（1日1回）
  const grantAmnesty = async () => {
    if (amnestyUsedToday) {
      Alert.alert('恩赦は1日1回のみ', '今日はもう使用済みです');
      return;
    }
    
    setAmnestyUsedToday(true);
    setMissionAlarmActive(false);
    setShowMissionAlarm(false);
    setMissionStatus('amnesty');
    
    setAlternativeAction(generateAlternativeAction());
    setShowAlternativeAction(true);
    
    await saveMissionState({
      status: 'amnesty',
      alarmActive: false,
      amnestyUsed: true,
    });
    
    const xpGain = 25;
    await addXpWithLevelCheck(xpGain);
  };

  // 代替行動完了
  const completeAlternativeAction = () => {
    setShowAlternativeAction(false);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('代替行動完了！+25 XP');
  };

  // 自作ミッションのバリデーション
  const validateSelfMission = (text: string): { valid: boolean; error?: string } => {
    const timePatterns = /(\d+秒|\d+分|\d+時間|[0-9]+sec|[0-9]+min)/i;
    if (!timePatterns.test(text)) {
      return { valid: false, error: '時間を含めてください（例：3分、60秒）' };
    }
    
    const placePatterns = /(立って|座って|机|玄関|風呂|洗面|トイレ|外|ベッド|リビング|キッチン|で)/i;
    if (!placePatterns.test(text)) {
      return { valid: false, error: '場所か姿勢を含めてください（例：立って、机で）' };
    }
    
    return { valid: true };
  };

  // 自作ミッションを設定
  const setSelfMission = async (text: string) => {
    const validation = validateSelfMission(text);
    if (!validation.valid) {
      Alert.alert('ミッションの形式', validation.error);
      return false;
    }
    
    setSamuraiMissionText(text);
    setMissionSource('self');
    setMissionStatus('offered');
    await saveMissionState({
      missionText: text,
      source: 'self',
      status: 'offered',
    });
    return true;
  };

  // クイズタイマー
  useEffect(() => {
    if (!showMissionAlarm || missionQuizTimeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setMissionQuizTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showMissionAlarm, missionQuizTimeLeft]);

  // タイムアウトで不正解扱い
  useEffect(() => {
    if (showMissionAlarm && missionQuizTimeLeft === 0) {
      playWrongSound();
      setMissionQuizCorrectStreak(0);
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizTimeLeft(10);
    }
  }, [missionQuizTimeLeft, showMissionAlarm]);

  // アラーム表示時にクイズ初期化
  useEffect(() => {
    if (showMissionAlarm) {
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizCorrectStreak(0);
      setMissionQuizTimeLeft(10);
    }
  }, [showMissionAlarm]);

  // =========================
  // Daily log actions (goal/review)
  // =========================

  const handleSaveTodayMission = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    await tap('light');

    await upsertTodayLog(prev => {
      const prevTodos = prev?.todos ?? [];
      const todoLines = todoInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const todos: TodoItem[] = todoLines.map((text, index) => {
        const existing = prevTodos.find(t => t.text === text);
        return existing ?? { id: `${getTodayStr()}-${index}`, text, done: false };
      });

      const routineLines = routineText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const prevDone = prev?.routineDone ?? [];
      const newRoutineDone = prevDone.filter(r => routineLines.includes(r));

      return {
        date: getTodayStr(),
        mission: missionInput.trim(),
        routines: routineLines,
        todos,
        review: prev?.review,
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: newRoutineDone,
      };
    });
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
    triggerYokaiDefeat('goal', 15);
  };
  const handleSaveNightReview = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    await tap('light');

    const targetDate = selectedDate || getTodayStr();

    await upsertLogForDate(targetDate, prev => ({
      date: targetDate,
      mission: prev?.mission ?? '',
      routines: prev?.routines ?? [],
      todos: prev?.todos ?? [],
      review: {
        proud: proudInput.trim(),
        lesson: lessonInput.trim(),
        nextAction: nextActionInput.trim(),
      },
      samuraiMission: prev?.samuraiMission,
      missionCompleted: prev?.missionCompleted ?? false,
      routineDone: prev?.routineDone ?? [],
    }));
    showSaveSuccess('振り返り完了。明日も斬れ！');
    triggerYokaiDefeat('review', 20);
  };

  const toggleTodoDone = async (date: string, todoId: string) => {
    playCheckSound();
    await tap('select');

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      return {
        ...log,
        todos: log.todos.map(t => (t.id === todoId ? { ...t, done: !t.done } : t)),
      };
    });

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const toggleRoutineDone = async (date: string, label: string) => {
    playCheckSound();
    await tap('select');

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      const prevDone = log.routineDone ?? [];
      const exists = prevDone.includes(label);
      const updatedDone = exists ? prevDone.filter(r => r !== label) : [...prevDone, label];
      return { ...log, routineDone: updatedDone };
    });

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const handleGenerateSamuraiMission = async () => {
    if (isGeneratingMission) return;

    await tap('medium');

    setIsGeneratingMission(true);
    try {
      const mission = await callSamuraiMissionGPT();
      setSamuraiMissionText(mission);
      setMissionSource('ai');
      setMissionStatus('offered');
      
      // ミッション状態を保存
      await saveMissionState({
        missionText: mission,
        source: 'ai',
        status: 'offered',
      });

      await upsertTodayLog(prev => ({
        date: getTodayStr(),
        mission: prev?.mission ?? missionInput.trim(),
        routines: prev?.routines ?? [],
        todos: prev?.todos ?? [],
        review: prev?.review,
        samuraiMission: mission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: prev?.routineDone ?? [],
      }));
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-mission-err`,
          from: 'king',
          text: 'サムライミッション生成でエラーが出たでござる。ネット環境とサーバーを確認してほしいでござる。',
        },
      ]);
    } finally {
      setIsGeneratingMission(false);
    }
  };

  const handleCompleteSamuraiMission = async () => {
    if (!samuraiMissionText || missionCompletedToday) return;

    await tap('success');

    const gainedXp = 10;
    await addXpWithLevelCheck(gainedXp);

    setMissionCompletedToday(true);

    await upsertTodayLog(prev => ({
      date: getTodayStr(),
      mission: prev?.mission ?? missionInput.trim(),
      routines: prev?.routines ?? [],
      todos: prev?.todos ?? [],
      review: prev?.review,
      samuraiMission: samuraiMissionText,
      missionCompleted: true,
      routineDone: prev?.routineDone ?? [],
    }));

    const praiseText = `よくやった。今日のサムライミッション「${samuraiMissionText}」は達成だ。\n10XP獲得でござる。`;
    setMessages(prev => [...prev, { id: `${Date.now()}-xp`, from: 'king', text: praiseText }]);
    speakSamurai(praiseText);
  };

  // =========================
  // Onboarding save
  // =========================
  const handleSaveOnboarding = async () => {
    const identity = obIdentity.trim();
    const quit = obQuit.trim();
    const rule = obRule.trim();
    if (!identity) return;

    await tap('light');

    const data: OnboardingData = { identity, quit, rule };
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
      setOnboardingData(data);
      setIsEditingOnboarding(false);
      setIsOnboarding(false);
    } catch (e) {
      console.error('Failed to save onboarding', e);
    }
  };

  // =========================
  // Blocklist actions
  // =========================
  const handleAddBlockDomain = async () => {
    const value = blocklistInput.trim();
    if (!value) return;

    const normalized = value.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    const newList = Array.from(new Set([...blockedDomains, normalized]));

    setBlockedDomains(newList);
    setBlocklistInput('');
    try {
      await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save blocklist', e);
    }
  };

  const handleRemoveBlockDomain = async (domain: string) => {
    const newList = blockedDomains.filter(d => d !== domain);
    setBlockedDomains(newList);
    try {
      await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save blocklist', e);
    }
  };

  const handleOpenBrowserUrl = async () => {
    let url = browserUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;

    setBrowserUrl(url);
    setCurrentUrl(url);
    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
  };

  // =========================
  // Reset actions
  // =========================
  const handleClearHistory = () => {
    Alert.alert('相談履歴を削除', 'これまでのサムライ相談の履歴をすべて消すでござる。よろしいか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除する',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
          } catch (e) {
            console.error('Failed to clear history', e);
          }
        },
      },
    ]);
  };

  const handleClearChatMessages = () => {
    Alert.alert('チャット画面をリセット', '会話バブルを全部消して、最初の一言だけに戻すでござる。よろしいか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセットする',
        style: 'destructive',
        onPress: () => {
          setMessages([{ id: 'first', from: 'king', text: 'おいおいどうした？その欲望を断ち切るぞ。' }]);
          setInput('');
          setIsSending(false);
        },
      },
    ]);
  };

  const handleResetTodayLog = () => {
    Alert.alert('今日の目標・日記をリセット', `${getTodayStr()} の目標・ルーティン・振り返りを消すでござる。よろしいか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセットする',
        style: 'destructive',
        onPress: async () => {
          try {
            const t = getTodayStr();
            const newLogs = dailyLogs.filter(log => log.date !== t);
            setDailyLogs(newLogs);
            await saveDailyLogsToStorage(newLogs);

            setMissionInput('');
            setRoutineText('');
            setTodoInput('');
            setProudInput('');
            setLessonInput('');
            setNextActionInput('');
            setSamuraiMissionText('');
            setMissionCompletedToday(false);
          } catch (e) {
            console.error('Failed to reset today log', e);
          }
        },
      },
    ]);
  };

  // =========================
  // Calendar edit actions
  // =========================
  const handleEditLogFromCalendar = (log: DailyLog) => {
    playTapSound();
    setEditingLogDate(log.date);
    setEditProud(log.review?.proud ?? '');
    setEditLesson(log.review?.lesson ?? '');
    setEditNextAction(log.review?.nextAction ?? '');
  };

  const handleSaveEditedLog = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    if (!editingLogDate) return;

    const newLogs = dailyLogs.map(log =>
      log.date === editingLogDate
        ? {
            ...log,
            review: { proud: editProud, lesson: editLesson, nextAction: editNextAction },
          }
        : log,
    );

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);

    showSaveSuccess('編集完了。記録を更新した！');
    setEditingLogDate(null);
    setEditProud('');
    setEditLesson('');
    setEditNextAction('');
  };

  const handleDeleteLog = async (date: string) => {
    const newLogs = dailyLogs.filter(log => log.date !== date);
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);

    if (selectedDate === date) setSelectedDate(null);
  };

  // =========================
  // Routine chip toggle
  // =========================
  const handleToggleRoutineChip = (label: string) => {
    playTapSound();
    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
    const lines = routineText.split('\n').map(l => l.trim()).filter(Boolean);
    const exists = lines.includes(label);
    const newLines = exists ? lines.filter(l => l !== label) : [...lines, label];
    setRoutineText(newLines.join('\n'));
  };

  // =========================
  // Derived values
  // =========================
  const sortedDailyLogs: DailyLog[] = useMemo(() => {
    return Array.isArray(dailyLogs) ? [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date)) : [];
  }, [dailyLogs]);

  const streakCount = useMemo(() => getStreakCount(sortedDailyLogs), [sortedDailyLogs]);
  const { level: samuraiLevel, progress: levelProgress, daysToClear } = useMemo(
    () => getSamuraiLevelInfo(streakCount),
    [streakCount],
  );
  const rank = useMemo(() => getRankFromXp(totalXp), [totalXp]);

  const activeDate = useMemo(() => {
    return (
      selectedDate ||
      (sortedDailyLogs.length ? sortedDailyLogs[sortedDailyLogs.length - 1].date : null)
    );
  }, [selectedDate, sortedDailyLogs]);

  const activeLog = useMemo(() => {
    return activeDate ? sortedDailyLogs.find(log => log.date === activeDate) : null;
  }, [activeDate, sortedDailyLogs]);

  // =========================
  // Render helpers
  // =========================
  // スタート画面
  const startScreenQuotes = [
    '今日も一刀両断。',
    '迷いを斬れ。',
    '己に克て。',
    '武士道とは、死ぬことと見つけたり。',
    '行動こそが、すべてを変える。',
  ];
  const randomQuote = startScreenQuotes[Math.floor(Math.random() * startScreenQuotes.length)];

  // Intro画面（動画版）
  const renderIntroScreen = () => (
    <View style={styles.introScreen}>
      <Video
        source={INTRO_VIDEO}
        style={styles.introVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        volume={MASTER_VOLUME}
        onPlaybackStatusUpdate={(status: any) => {
          if (status.didJustFinish && !videoFinished) {
            setVideoFinished(true);
          }
        }}
      />
      {/* 動画再生中はスキップボタン、終了後はホームへボタン */}
      {videoFinished ? (
        <View style={styles.introBottomContainer}>
          <Pressable style={styles.introHomeButton} onPress={() => { playTapSound(); handleCloseIntro(); }}>
            <Text style={styles.introHomeButtonText}>ホームへ →</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.introSkipButton} onPress={() => { playTapSound(); handleCloseIntro(); }}>
          <Text style={styles.introSkipButtonText}>スキップ →</Text>
        </Pressable>
      )}
    </View>
  );

  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      {/* 道場入口 */}
      {showDojoGate && (
        <View style={styles.dojoGateOverlay}>
          {/* 暗い門 */}
          <Animated.Image
            source={DOJO_GATE_DIM}
            style={[styles.dojoGateImage, { opacity: dimOpacity }]}
            resizeMode="cover"
          />
          {/* 明るい門 */}
          <Animated.Image
            source={DOJO_GATE_LIGHT}
            style={[styles.dojoGateImage, { opacity: lightOpacity, position: 'absolute' }]}
            resizeMode="cover"
          />
          {/* 道場に入るボタン */}
          <Animated.View style={[styles.dojoGateButtonContainer, { opacity: buttonOpacity }]}>
            <Pressable style={styles.dojoGateButton} onPress={handleEnterDojo}>
              <Text style={styles.dojoGateButtonText}>道場に入る</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
      
      <Pressable
        style={styles.settingsIconButton}
        onPress={() => {
          playTapSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTab('settings');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.settingsIconText}>⚙️</Text>
      </Pressable>
      <Pressable 
        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setTab('character'); 
          } else { 
            showSaveSuccess('修行の成果は、やがて姿を持つ'); 
          } 
        }}
 
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, alignItems: 'center' }]}
      >
        <Animated.View style={{ 
          opacity: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
          transform: [{ scale: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
          shadowColor: getLevelFromXp(totalXp).level >= 1 ? '#D4AF37' : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: getLevelFromXp(totalXp).level >= 1 ? 0.8 : 0,
          shadowRadius: 15,
        }}>
          <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
        </Animated.View>
        {getLevelFromXp(totalXp).level >= 1 && (
          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', marginTop: 4 }}>
            Lv.{getLevelFromXp(totalXp).level}
          </Text>
        )}
      </Pressable>
      <Text style={styles.dojoTitle}>道場</Text>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('consult');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>相談する</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('gratitude');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>感謝を書く</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('goal');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>今日の目標</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('review');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>振り返り</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('focus');
          setShowStartScreen(false);
          setShowFocusEntry(true);
          setFocusType('select');
        }}
      >
        <Text style={styles.startButtonText}>集中する</Text>
      </Pressable>
      
      <Pressable
        style={[styles.startButton, !isPro && getLevelFromXp(totalXp).level < 5 && { opacity: 0.4 }]}
        onPress={() => {
          if (!isPro && getLevelFromXp(totalXp).level < 5) {
            playTapSound();
            showSaveSuccess('Lv.5「若侍」で解放');
            return;
          }
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>明日に備える{!isPro && getLevelFromXp(totalXp).level < 5 ? ' 🔒' : ''}</Text>
      </Pressable>
    </View>
  );

  // トースト表示（済マーク付き）
  const renderSaveToast = () => (
    showSaveToast ? (
      <View style={styles.toastContainer}>
        <Text style={styles.toastCheckmark}>✓</Text>
        <Text style={styles.toastText}>{saveToastMessage}</Text>
      </View>
    ) : null
  );

  const renderTabButton = (value: typeof tab, label: string) => (
    <Pressable
      onPress={() => {
        playTapSound();
        if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
        setTab(value);
      }}
      style={[styles.tabButton, tab === value && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, tab === value && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );

  // =========================
  // Tabs
  // =========================

  const renderConsultTab = () => {
    const historyToShow = history.length > 50 ? history.slice(history.length - 50) : history;

    // 選択画面
    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={styles.consultSelectContainer}>
            {/* タイトル */}
            <View style={styles.consultTitleBox}>
              <Text style={styles.consultTitle}>サムライ相談所</Text>
              <Text style={styles.consultSubtitle}>〜欲望を一刀両断〜</Text>
            </View>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を話してみろ</Text>
            </Pressable>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を見せてみろ</Text>
            </Pressable>
          </View>
        </ImageBackground>
      );
    }

    return (
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 24 }} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* 戻るボタン */}
        <Pressable style={styles.consultBackButton} onPress={() => { playTapSound(); setConsultMode('select'); setIsSummoned(false); }}>
          <Text style={styles.consultBackButtonText}>← 戻る</Text>
        </Pressable>

        {consultMode === 'visualize' ? (
          <View style={styles.yokubouBox}>
            <Text style={styles.yokubouTitle}>📸 欲望を可視化せよ</Text>
            <Text style={styles.yokubouSub}>今やりたいことの写真を撮り、なぜやりたいか書け。AIが核心を突く。</Text>

            {yokubouImage ? (
              <Pressable style={styles.yokubouImagePicker} onPress={() => { playTapSound(); pickYokubouImage(); }}>
                <Image source={{ uri: yokubouImage }} style={styles.yokubouImagePreview} />
              </Pressable>
            ) : (
              <View style={styles.yokubouImagePicker}>
                <Text style={styles.yokubouImagePlaceholder}>欲望の対象を撮影せよ</Text>
              </View>
            )}

            <View style={styles.yokubouButtonRow}>
              <Pressable style={styles.yokubouCameraButton} onPress={() => { playTapSound(); takeYokubouPhoto(); }}>
                <Text style={styles.yokubouCameraButtonText}>📷 撮影</Text>
              </Pressable>
              <Pressable style={styles.yokubouGalleryButton} onPress={() => { playTapSound(); pickYokubouImage(); }}>
                <Text style={styles.yokubouGalleryButtonText}>🖼 選択</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.yokubouInput}
              value={yokubouReason}
              onChangeText={setYokubouReason}
              placeholder="なぜ今それをやりたい？正直に書け。"
              placeholderTextColor="#666"
              multiline
            />

            <Pressable
              style={[styles.yokubouSubmitButton, (!yokubouImage || !yokubouReason.trim()) && { opacity: 0.5 }]}
              onPress={handleYokubouSubmit}
              disabled={!yokubouImage || !yokubouReason.trim() || isLoadingYokubou}
            >
              {isLoadingYokubou ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.yokubouSubmitText}>AIに問う</Text>
              )}
            </Pressable>

            {yokubouAiReply !== '' && (
              <View style={styles.yokubouReplyBox}>
                <Text style={styles.yokubouReplyLabel}>サムライキング：</Text>
                <Text style={styles.yokubouReplyText}>{yokubouAiReply}</Text>

                {!yokubouSaved && (
                  <Pressable style={styles.yokubouSaveButton} onPress={handleYokubouSave}>
                    <Text style={styles.yokubouSaveText}>ログに保存</Text>
                  </Pressable>
                )}
                {yokubouSaved && (
                  <Text style={styles.yokubouSavedText}>✓ 保存済み</Text>
                )}
              </View>
            )}

            {(yokubouImage || yokubouReason || yokubouAiReply) && (
              <Pressable style={styles.yokubouResetButton} onPress={() => { playTapSound(); resetYokubou(); }}>
                <Text style={styles.yokubouResetText}>リセット</Text>
              </Pressable>
            )}
          </View>
        ) : !isSummoned ? (
          <View style={styles.summonBox}>
            <Text style={styles.summonTitle}>Samurai King is waiting…</Text>
            <Text style={styles.summonText}>
              サムライキングは静かにお主を待っている。{'\n'}
              呼び出したあと「チャット」で本音を書いていくのだ。
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.modeRow}>
              <Pressable style={[styles.modeButton, mode === 'chat' && styles.modeButtonActive]} onPress={handleSwitchToChat}>
                <Text style={[styles.modeButtonText, mode === 'chat' && styles.modeButtonTextActive]}>チャット</Text>
              </Pressable>

              <Pressable
                style={[styles.modeButton, mode === 'history' && styles.modeButtonActive, { marginRight: 0, marginLeft: 4 }]}
                onPress={handleSwitchToHistory}
              >
                <Text style={[styles.modeButtonText, mode === 'history' && styles.modeButtonTextActive]}>履歴</Text>
              </Pressable>
            </View>

            <View style={styles.chatBox}>
              {mode === 'chat' ? (
                <>
                  <Text style={styles.chatTitle}>Samurai King Chat</Text>

                  <ScrollView
                    ref={messagesRef}
                    style={[styles.messages, { maxHeight: 320 }]}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}
                  >
                    {messages.map(m => (
                      <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.kingBubble]}>
                        <Text style={styles.bubbleLabel}>{m.from === 'user' ? 'You' : 'Samurai King'}</Text>
                        <Text style={styles.bubbleText}>{m.id === typingMessageId ? typingText : m.text}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* 相談からミッションを作るボタン（Pro限定・送信中は非表示） */}
                  {canCreateMission && isPro && !dailyMissionUsed && missionStatus === 'none' && !isSending && !typingMessageId && (
                    <Pressable
                      style={styles.createMissionButton}
                      onPress={() => { playTapSound(); generateMissionFromConsult(); }}
                      disabled={isGeneratingMissionFromConsult}
                    >
                      <Text style={styles.createMissionButtonText}>
                        {isGeneratingMissionFromConsult ? 'ミッション生成中...' : '⚔️ この相談からミッションを作る'}
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={input}
                      onChangeText={setInput}
                      placeholder="今のムラムラや悩みを正直に書くのだ…"
                      placeholderTextColor="#666"
                      multiline
                      blurOnSubmit
                      returnKeyType="done"
                      onSubmitEditing={handleSend}
                    />
                    <Pressable
                      style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
                      onPress={handleSend}
                      disabled={!input.trim() || isSending}
                    >
                      {isSending ? <ActivityIndicator color="#022c22" /> : <Text style={styles.sendText}>送信</Text>}
                    </Pressable>
                  </View>

                  <Text style={styles.privacyNote}>
                    ※ 相談内容はこのスマホとサムライキングAIだけに使われる。{'\n'}
                    開発者本人が個別の相談内容を見ることはないでござる。
                  </Text>

                  <Pressable style={styles.secondaryButton} onPress={() => { playTapSound(); handleClearChatMessages(); }}>
                    <Text style={styles.secondaryButtonText}>チャット画面をリセット</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.chatTitle}>Samurai Log History</Text>

                  {isLoadingHistory ? (
                    <Text style={styles.historyInfo}>履歴を読み込み中でござる…</Text>
                  ) : historyToShow.length === 0 ? (
                    <Text style={styles.historyInfo}>まだ記録はないでござる。最初の相談をすると自動でここにたまっていくでござる。</Text>
                  ) : (
                    <>
                      {historyToShow
                        .slice(-50)
                        .reverse()
                        .map(entry => {
                          let dateLabel = '';
                          try {
                            const d = new Date(entry.date);
                            dateLabel = Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
                          } catch {
                            dateLabel = '';
                          }

                          return (
                            <View key={entry.id} style={styles.historyEntry}>
                              {dateLabel !== '' && <Text style={styles.historyDate}>{dateLabel}</Text>}

                              {entry.imageUri && (
                                <Image source={{ uri: entry.imageUri }} style={styles.historyImage} />
                              )}

                              <Text style={styles.historyLabel}>◆ 相談：</Text>
                              <Text style={styles.historyText}>{entry.issue}</Text>

                              <Text style={styles.historyLabel}>◆ 本当はこうなりたい：</Text>
                              <Text style={styles.historyText}>
                                {entry.reflection && entry.reflection.trim() !== '' ? entry.reflection : '（未記入）'}
                              </Text>

                              <Text style={styles.historyLabel}>◆ サムライキング：</Text>
                              <Text style={styles.historyText}>{entry.reply}</Text>
                            </View>
                          );
                        })}

                      <Pressable style={styles.secondaryButton} onPress={() => { playTapSound(); handleClearHistory(); }}>
                        <Text style={styles.secondaryButtonText}>相談履歴を全部削除</Text>
                      </Pressable>
                    </>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  const renderGoalTab = () => {
    const currentRoutineLines = routineText.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>今日のサムライ目標</Text>
          <Text style={styles.goalSub}>{getTodayStr()} のミッションを 1つだけ決めるのだ。</Text>

          <View style={{ marginBottom: 12 }}>
            <View style={styles.samuraiMissionHeaderRow}>
              <Text style={styles.samuraiMissionTitle}>サムライミッション</Text>
              <Text style={styles.samuraiMissionXp}>{isPro ? '達成で 50XP' : 'Pro限定'}</Text>
            </View>
            
            {isPro ? (
              <>
                <Text style={styles.goalSub}>AIが「今日やるといい一手」をくれるでござる。</Text>

                {/* ミッションステータス表示 */}
                {missionStatus !== 'none' && missionStatus !== 'offered' && (
                  <View style={{ backgroundColor: '#2a2a3e', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                    <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>
                      ステータス: {
                        missionStatus === 'accepted' ? '⏳ 受諾済み（行動待ち）' :
                        missionStatus === 'started' ? '🔥 行動開始' :
                        missionStatus === 'completed' ? '✅ 完了' :
                        missionStatus === 'expired' ? '⚠️ 期限切れ' :
                        missionStatus === 'amnesty' ? '🙏 恩赦' : ''
                      }
                    </Text>
                    {missionStatus === 'accepted' && missionDeadlineAt && (
                      <Text style={{ color: '#FF4444', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                        残り: {Math.max(0, Math.floor((missionDeadlineAt - Date.now()) / 1000 / 60))}分
                      </Text>
                    )}
                  </View>
                )}

                {samuraiMissionText ? (
                  <View style={styles.samuraiMissionBox}>
                    <Text style={styles.samuraiMissionText}>{samuraiMissionText}</Text>
                    
                    {/* 受諾前：受諾ボタン表示 */}
                    {missionStatus === 'offered' && (
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ color: '#888', marginRight: 8 }}>期限:</Text>
                          <Pressable onPress={() => setMissionDeadlineMinutes(5)} style={{ backgroundColor: missionDeadlineMinutes === 5 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 5 ? '#000' : '#FFF' }}>5分</Text>
                          </Pressable>
                          <Pressable onPress={() => setMissionDeadlineMinutes(10)} style={{ backgroundColor: missionDeadlineMinutes === 10 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 10 ? '#000' : '#FFF' }}>10分</Text>
                          </Pressable>
                          <Pressable onPress={() => setMissionDeadlineMinutes(30)} style={{ backgroundColor: missionDeadlineMinutes === 30 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 30 ? '#000' : '#FFF' }}>30分</Text>
                          </Pressable>
                        </View>
                        <Pressable
                          style={[styles.samuraiMissionButton, { backgroundColor: '#D4AF37' }]}
                          onPress={acceptMission}
                        >
                          <Text style={[styles.samuraiMissionButtonText, { color: '#000' }]}>契約する（{missionDeadlineMinutes}分以内に行動開始）</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* 受諾後〜完了前：完了ボタン表示 */}
                    {(missionStatus === 'accepted' || missionStatus === 'started') && (
                      <Pressable
                        style={styles.samuraiMissionButton}
                        onPress={completeMission}
                      >
                        <Text style={styles.samuraiMissionButtonText}>ミッション完了！</Text>
                      </Pressable>
                    )}

                    {/* 完了済み */}
                    {(missionStatus === 'completed' || missionStatus === 'amnesty') && (
                      <View style={[styles.samuraiMissionButton, { opacity: 0.5 }]}>
                        <Text style={styles.samuraiMissionButtonText}>
                          {missionStatus === 'completed' ? '✅ 達成済み！' : '🙏 恩赦済み'}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Pressable 
                    style={[styles.samuraiMissionButton, dailyMissionUsed && { opacity: 0.5 }]} 
                    onPress={() => { 
                      if (dailyMissionUsed) {
                        Alert.alert('今日のミッションは終了', '明日また挑戦しよう！');
                        return;
                      }
                      playTapSound(); 
                      handleGenerateSamuraiMission(); 
                    }}
                    disabled={dailyMissionUsed}
                  >
                    <Text style={styles.samuraiMissionButtonText}>
                      {dailyMissionUsed ? '今日のミッション終了' : isGeneratingMission ? '生成中…' : 'サムライミッションを受け取る'}
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              // 無料ユーザー向け：Proへのアップグレード促進
              <View>
                <Text style={styles.goalSub}>Proになると、サムライキングからミッションを受け取り、期限付きで挑戦できる。逃げたらアラームが鳴る。本気で変わりたい者だけの機能だ。</Text>
                <Pressable 
                  style={[styles.samuraiMissionButton, { backgroundColor: '#D4AF37' }]}
                  onPress={() => setShowPaywall(true)}
                >
                  <Text style={[styles.samuraiMissionButtonText, { color: '#000' }]}>🔓 Proで解放する</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text style={styles.goalSub}>自分で決める今日のミッション</Text>
          <TextInput
            style={styles.bigInput}
            value={missionInput}
            onChangeText={setMissionInput}
            placeholder="例）YouTubeを1本出す / HIITを10分やる"
            placeholderTextColor="#666"
            multiline
          />

          <Text style={styles.goalSub}>今日のルーティン（タップで追加 or 手入力）</Text>
          <View style={styles.chipRow}>
            {DEFAULT_ROUTINES.map(r => {
              const active = currentRoutineLines.includes(r);
              return (
                <Pressable
                  key={r}
                  style={[styles.routineChip, active && styles.routineChipActive]}
                  onPress={() => handleToggleRoutineChip(r)}
                >
                  <Text style={[styles.routineChipText, active && styles.routineChipTextActive]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={[styles.todoInput, { marginTop: 8 }]}
            value={routineText}
            onChangeText={setRoutineText}
            placeholder={'例）\n英語1000語\nHIIT 10分\n瞑想5分'}
            placeholderTextColor="#666"
            multiline
          />

          <Text style={[styles.goalSub, { marginTop: 16 }]}>ToDo（改行で複数入力できる）</Text>
          <TextInput
            style={styles.todoInput}
            value={todoInput}
            onChangeText={setTodoInput}
            placeholder={'例）\nYouTube編集を30分\nレゲエの曲を1曲書く'}
            placeholderTextColor="#666"
            multiline
          />

          <Pressable style={styles.primaryButton} onPress={() => { playTapSound(); handleSaveTodayMission(); }}>
            <Text style={styles.primaryButtonText}>今日の目標を保存する</Text>
          </Pressable>

          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => { playTapSound(); handleResetTodayLog(); }}>
            <Text style={styles.secondaryButtonText}>今日の目標・日記をリセット</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderReviewTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      {onboardingData && (
        <View style={styles.goalCard}>
          <View style={styles.samuraiHeaderTopRow}>
            <Text style={styles.samuraiHeaderTitle}>サムライ宣言</Text>
            <Pressable
              onPress={() => {
                if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                showSaveSuccess('サムライ宣言を編集するでござる');
                setIsEditingOnboarding(true);
                setObIdentity(onboardingData.identity ?? '');
                setObQuit(onboardingData.quit ?? '');
                setObRule(onboardingData.rule ?? '');
              }}
              style={styles.samuraiEditButton}
            >
              <Text style={styles.samuraiEditText}>編集</Text>
            </Pressable>
          </View>

          {isEditingOnboarding ? (
            <>
              <Text style={styles.onboardingLabel}>1. どんなサムライで生きたい？</Text>
              <TextInput style={styles.onboardingInput} value={obIdentity} onChangeText={setObIdentity} multiline />
              <Text style={styles.onboardingLabel}>2. やめたい習慣は？</Text>
              <TextInput style={styles.onboardingInput} value={obQuit} onChangeText={setObQuit} multiline />
              <Text style={styles.onboardingLabel}>3. 毎日のマイルール</Text>
              <TextInput style={styles.onboardingInput} value={obRule} onChangeText={setObRule} multiline />

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Pressable style={[styles.onboardingButton, { flex: 1, marginRight: 4 }]} onPress={() => { playTapSound(); handleSaveOnboarding(); }}>
                  <Text style={styles.onboardingButtonText}>保存</Text>
                </Pressable>
                <Pressable
                  style={[styles.onboardingButton, { flex: 1, marginLeft: 4, backgroundColor: '#374151' }]}
                  onPress={() => {
                    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                    setIsEditingOnboarding(false);
                    setObIdentity(onboardingData.identity ?? '');
                    setObQuit(onboardingData.quit ?? '');
                    setObRule(onboardingData.rule ?? '');
                  }}
                >
                  <Text style={[styles.onboardingButtonText, { color: '#e5e7eb' }]}>キャンセル</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.samuraiHeaderLabel}>◆ 俺が目指すサムライ像</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.identity || '（未入力）'}</Text>
              <Text style={styles.samuraiHeaderLabel}>◆ やめる習慣</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.quit || '（未入力）'}</Text>
              <Text style={styles.samuraiHeaderLabel}>◆ 毎日のルール</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.rule || '（未入力）'}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>サムライRPGダッシュボード</Text>
        <Text style={styles.goalSub}>連続ログ：{streakCount} 日でござる🔥</Text>
        <Text style={styles.goalSub}>
          サムライレベル：Lv.{samuraiLevel} / {MAX_LEVEL}{' '}
          {samuraiLevel >= MAX_LEVEL ? '（伝説の侍クリア！）' : `（あと ${daysToClear} 日で伝説の侍）`}
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(levelProgress * 100)}%` }]} />
        </View>
        <Text style={styles.progressHint}>3日続けるごとにレベルアップ。1ヶ月やり切れば伝説クリアでござる。</Text>

        <Text style={styles.goalSub}>
          総経験値：{totalXp} XP（ランク：{rank.label}
          {rank.next > 0 ? ` / 次のランクまで ${rank.next} XP` : ' / MAX'}）
        </Text>

        <SamuraiAvatar level={samuraiLevel} rankLabel={rank.label} />

        <Text style={[styles.goalTitle, { fontSize: 16, marginTop: 6 }]}>サムライ日記カレンダー</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
          {sortedDailyLogs.map(log => {
            const isActive = log.date === activeDate;
            return (
              <Pressable
                key={log.date}
                onPress={() => {
                  if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                  setSelectedDate(log.date);
                }}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>{formatDateLabel(log.date)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeLog ? (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.historyDate}>{activeLog.date}</Text>

            <Text style={styles.historyLabel}>◆ 目標</Text>
            <Text style={styles.historyText}>{activeLog.mission || '（未入力だぞ）'}</Text>

            <Text style={styles.historyLabel}>◆ サムライミッション</Text>
            <Text style={styles.historyText}>
              {activeLog.samuraiMission
                ? `${activeLog.samuraiMission} ${activeLog.missionCompleted ? '（達成済み）' : '（未達成）'}`
                : '（まだ受け取っていないぞ）'}
            </Text>

            <Text style={styles.historyLabel}>◆ サムライルーティン</Text>
            {activeLog.routines.length === 0 ? (
              <Text style={styles.historyText}>（まだ選ばれていないぞ）</Text>
            ) : (
              activeLog.routines.map(r => {
                const done = activeLog.routineDone?.includes(r);
                return (
                  <Pressable key={r} style={styles.todoRow} onPress={() => toggleRoutineDone(activeLog.date, r)}>
                    <View style={[styles.checkbox, done && styles.checkboxChecked]} />
                    <Text style={[styles.todoText, done && styles.todoTextDone]}>{r}</Text>
                  </Pressable>
                );
              })
            )}

            <Text style={styles.historyLabel}>◆ ToDo</Text>
            {activeLog.todos.length === 0 ? (
              <Text style={styles.historyText}>（登録なしだ）</Text>
            ) : (
              activeLog.todos.map(todo => (
                <Pressable key={todo.id} style={styles.todoRow} onPress={() => toggleTodoDone(activeLog.date, todo.id)}>
                  <View style={[styles.checkbox, todo.done && styles.checkboxChecked]} />
                  <Text style={[styles.todoText, todo.done && styles.todoTextDone]}>{todo.text}</Text>
                </Pressable>
              ))
            )}

            <Text style={styles.historyLabel}>◆ 今日の善行</Text>
            {!activeLog.goodDeeds || activeLog.goodDeeds.length === 0 ? (
              <Text style={styles.historyText}>（記録なし）</Text>
            ) : (
              activeLog.goodDeeds.map((deed, idx) => (
                <View key={idx} style={styles.goodDeedLogItem}>
                  <Text style={styles.goodDeedLogText}>🌟 {deed}</Text>
                </View>
              ))
            )}

            {editingLogDate === activeLog.date ? (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editProud}
                  onChangeText={setEditProud}
                  placeholder="今日一番誇れる行動を書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 気づき・学び（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editLesson}
                  onChangeText={setEditLesson}
                  placeholder="気づき・学びを書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editNextAction}
                  onChangeText={setEditNextAction}
                  placeholder="明日変えてみる行動を書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveEditedLog(); }}>
                  <Text style={styles.appleMainButtonText}>変更を保存</Text>
                </Pressable>
                <Pressable
                  style={styles.appleCancelLink}
                  onPress={() => {
                    setEditingLogDate(null);
                    setEditProud('');
                    setEditLesson('');
                    setEditNextAction('');
                  }}
                >
                  <Text style={styles.appleCancelLinkText}>キャンセル</Text>
                </Pressable>
              </>
            ) : activeLog.date === getTodayStr() ? (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={proudInput}
                  onChangeText={setProudInput}
                  placeholder="今日一番誇れる行動は？"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={lessonInput}
                  onChangeText={setLessonInput}
                  placeholder="気づいたこと・学んだことは？"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={nextActionInput}
                  onChangeText={setNextActionInput}
                  placeholder="明日ひとつだけ変えてみる行動は？"
                  placeholderTextColor="#666"
                />

                <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveNightReview(); }}>
                  <Text style={styles.appleMainButtonText}>振り返りを保存</Text>
                </Pressable>
                <Pressable style={styles.appleDeleteLink} onPress={() => { playTapSound(); handleDeleteLog(activeLog.date); }}>
                  <Text style={styles.appleDeleteLinkText}>この日の記録を削除</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
                <Text style={styles.historyText}>{activeLog.review?.proud || '（未入力）'}</Text>

                <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
                <Text style={styles.historyText}>{activeLog.review?.lesson || '（未入力）'}</Text>

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
                <Text style={styles.historyText}>{activeLog.review?.nextAction || '（未入力）'}</Text>

                <Pressable style={styles.appleEditButton} onPress={() => { playTapSound(); handleEditLogFromCalendar(activeLog); }}>
                  <Text style={styles.appleEditButtonText}>編集する</Text>
                </Pressable>
                <Pressable style={styles.appleDeleteLink} onPress={() => { playTapSound(); handleDeleteLog(activeLog.date); }}>
                  <Text style={styles.appleDeleteLinkText}>この日の記録を削除</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.historyDate}>{getTodayStr()}</Text>
            <Text style={styles.goalSub}>今日の振り返りを書いてみよう</Text>

            <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={proudInput}
              onChangeText={setProudInput}
              placeholder="今日一番誇れる行動は？"
              placeholderTextColor="#666"
            />

            <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={lessonInput}
              onChangeText={setLessonInput}
              placeholder="気づいたこと・学んだことは？"
              placeholderTextColor="#666"
            />

            <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={nextActionInput}
              onChangeText={setNextActionInput}
              placeholder="明日ひとつだけ変えてみる行動は？"
              placeholderTextColor="#666"
            />

            <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveNightReview(); }}>
              <Text style={styles.appleMainButtonText}>振り返りを保存</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderBrowserTab = () => {
    const normalizedCurrent = currentUrl.replace(/^https?:\/\//, '').toLowerCase();
    const isBlocked = blockedDomains.some(domain => normalizedCurrent.startsWith(domain));

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>サムライブラウザ</Text>
          <Text style={styles.goalSub}>
            禁欲・集中モード用のブラウザでござる。ここでだけネットをする、というマイルールもオススメ。
          </Text>

          <View style={styles.urlRow}>
            <TextInput
              style={styles.urlInput}
              value={browserUrl}
              onChangeText={setBrowserUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="例）twitter.com / youtube.com"
              placeholderTextColor="#666"
            />
            <Pressable style={styles.urlOpenButton} onPress={handleOpenBrowserUrl}>
              <Text style={styles.urlOpenButtonText}>開く</Text>
            </Pressable>
          </View>

          <Text style={styles.browserInfo}>ブロック対象：{blockedDomains.length ? blockedDomains.join(', ') : '（未設定）'}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>ブロックリスト</Text>
          <Text style={styles.goalSub}>見たくないサイト（ドメイン）を登録しておくと、自動でブロックされる。</Text>

          <View style={styles.urlRow}>
            <TextInput
              style={styles.urlInput}
              value={blocklistInput}
              onChangeText={setBlocklistInput}
              autoCapitalize="none"
              placeholder="例）twitter.com"
              placeholderTextColor="#666"
            />
            <Pressable style={styles.urlOpenButton} onPress={handleAddBlockDomain}>
              <Text style={styles.urlOpenButtonText}>追加</Text>
            </Pressable>
          </View>

          {blockedDomains.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {blockedDomains.map(domain => (
                <View key={domain} style={styles.blockRow}>
                  <Text style={styles.blockDomain}>{domain}</Text>
                  <Pressable onPress={() => handleRemoveBlockDomain(domain)}>
                    <Text style={styles.blockRemove}>解除</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.browserContainer, { height: 420 }]}>
          {isBlocked ? (
            <View style={styles.blockedCard}>
              <Text style={styles.blockedTitle}>⚔️ そこは罠のサイトだぞ</Text>
              <Text style={styles.blockedText}>
                今アクセスしようとした場所は、お主が「封印」すると決めた領域だ。{'\n'}
                ここで時間やエネルギーを溶かすより、サムライミッションか目標に一手を打とう。
              </Text>

              <Pressable style={styles.blockedButton} onPress={() => setTab('consult')}>
                <Text style={styles.blockedButtonText}>今の気持ちを相談する</Text>
              </Pressable>
            </View>
          ) : (
            <WebView source={{ uri: currentUrl }} style={{ flex: 1 }} />
          )}
        </View>
      </ScrollView>
    );
  };

  // Paywallモーダル（App Store審査対応版）
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  const renderPaywall = () => (
    <Modal visible={showPaywall} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>道場に入る</Text>
          <Text style={styles.paywallSubtitle}>ここから先は、{'\n'}自分と向き合い続ける人のための場所です。</Text>
          
          {/* プラン選択 */}
          <View style={styles.planContainer}>
            <Pressable
              style={[styles.planOption, selectedPlan === 'annual' && styles.planSelected]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>2ヶ月分お得</Text></View>
              <Text style={styles.planName}>年額プラン</Text>
              <Text style={styles.planPrice}>{annualPrice}/年</Text>
            </Pressable>
            <Pressable
              style={[styles.planOption, selectedPlan === 'monthly' && styles.planSelected]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={styles.planName}>月額プラン</Text>
              <Text style={styles.planPrice}>{monthlyPrice}/月</Text>
            </Pressable>
          </View>

          {/* 購入ボタン */}
          <Pressable
            style={styles.paywallButton}
            onPress={async () => {
              const success = selectedPlan === 'annual' 
                ? await purchaseAnnual() 
                : await purchasePro();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallButtonText}>
              {selectedPlan === 'annual' ? '年額プランで始める' : '月額プランで始める'}
            </Text>
          </Pressable>

          {/* 購入を復元 */}
          <Pressable
            style={styles.paywallRestoreButton}
            onPress={async () => {
              const success = await restorePurchases();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallRestoreText}>購入を復元</Text>
          </Pressable>

          {/* 今は入らない */}
          <Pressable onPress={() => { playTapSound(); setShowPaywall(false); }}>
            <Text style={styles.paywallCloseText}>今は入らない</Text>
          </Pressable>

          {/* 法的説明（Apple必須） */}
          <Text style={styles.paywallLegal}>
            サブスクリプションは購入確認時にiTunesアカウントに請求されます。
            現在の期間終了の24時間前までにキャンセルしない限り、自動的に更新されます。
            購入後、設定アプリからいつでも管理・キャンセルできます。
          </Text>

          {/* 利用規約・プライバシーポリシー */}
          <View style={styles.paywallLinks}>
            <Pressable onPress={() => { setShowPaywall(false); setShowTerms(true); }}>
              <Text style={styles.paywallLinkText}>利用規約</Text>
            </Pressable>
            <Text style={styles.paywallLinkDivider}>｜</Text>
            <Pressable onPress={() => { setShowPaywall(false); setShowPrivacy(true); }}>
              <Text style={styles.paywallLinkText}>プライバシーポリシー</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ミッションアラームモーダル
  const renderMissionAlarm = () => (
    <Modal visible={showMissionAlarm} animationType="slide" transparent={false}>
      <View style={styles.missionAlarmContainer}>
        <Text style={styles.missionAlarmTitle}>⚠️ ミッション期限切れ ⚠️</Text>
        <Text style={styles.missionAlarmSubtitle}>アラームを解除するには以下のいずれかを実行</Text>
        
        {/* クイズ解除 */}
        <View style={styles.missionAlarmSection}>
          <Text style={styles.missionAlarmSectionTitle}>🧠 クイズ解除（{missionQuizCorrectStreak}/3問正解）</Text>
          <Text style={styles.missionQuizTimer}>残り {missionQuizTimeLeft}秒</Text>
          <Text style={styles.missionQuizQuestion}>{missionQuizQuestion.q}</Text>
          <TextInput
            style={styles.missionQuizInput}
            value={missionQuizAnswer}
            onChangeText={setMissionQuizAnswer}
            placeholder="答えを入力"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            autoFocus
          />
          <Pressable style={styles.missionAlarmButton} onPress={checkMissionQuizAnswer}>
            <Text style={styles.missionAlarmButtonText}>回答</Text>
          </Pressable>
        </View>

        {/* カメラ解除 */}
        <Pressable style={styles.missionAlarmSecondaryButton} onPress={dismissAlarmWithCamera}>
          <Text style={styles.missionAlarmSecondaryText}>📸 写真を撮って解除</Text>
        </Pressable>

        {/* 恩赦 */}
        {!amnestyUsedToday && (
          <Pressable style={styles.missionAmnestyButton} onPress={grantAmnesty}>
            <Text style={styles.missionAmnestyText}>🙏 今日は許してやろう（1日1回）</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );

  // 代替行動モーダル
  const renderAlternativeAction = () => (
    <Modal visible={showAlternativeAction} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>代替行動</Text>
          <Text style={styles.paywallSubtitle}>恩赦の代わりにこれをやれ</Text>
          <Text style={[styles.paywallPrice, { fontSize: 18, lineHeight: 28 }]}>{alternativeAction}</Text>
          <Pressable style={styles.paywallButton} onPress={completeAlternativeAction}>
            <Text style={styles.paywallButtonText}>完了した</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // ミッション提案モーダル（相談後に表示）
  const renderMissionProposal = () => (
    <Modal visible={showMissionProposal} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>⚔️ ミッション提案</Text>
          <Text style={styles.paywallSubtitle}>相談内容に基づく挑戦状</Text>
          
          <View style={styles.missionProposalBox}>
            <Text style={styles.missionProposalText}>{proposedMission}</Text>
          </View>
          
          <Text style={styles.missionProposalHint}>
            このミッションを受けると、期限内に行動を開始する必要があります。
            逃げると…サムライアラームが鳴り響きます。
          </Text>
          
          <Pressable 
            style={[styles.paywallButton, { backgroundColor: '#D4AF37' }]} 
            onPress={acceptProposedMission}
          >
            <Text style={[styles.paywallButtonText, { color: '#000' }]}>このミッションを受ける</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.paywallRestoreButton, { marginTop: 12 }]} 
            onPress={() => {
              playTapSound();
              setShowMissionProposal(false);
              setTab('goal'); // 目標タブに移動
            }}
          >
            <Text style={[styles.paywallRestoreText, { color: '#2DD4BF' }]}>自分でミッションを作る</Text>
          </Pressable>
          
          <Pressable 
            style={{ marginTop: 8, padding: 8 }} 
            onPress={rejectProposedMission}
          >
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>今はやらない</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // クイズ処理
  const handleQuizSubmit = () => {
    const current = quizData[quizIndex];
    if (quizAnswer.trim() === current.a) {
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuizResult('correct');
      setQuizScore(quizScore + 1);
    } else {
      playWrongSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setQuizResult('wrong');
    }
  };

  const handleNextQuiz = () => {
    setQuizAnswer('');
    setQuizResult(null);
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowQuiz(false);
      setQuizIndex(0);
      showSaveSuccess('クイズ完了！' + quizScore + '/' + quizData.length + '問正解');
    }
  };

  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            // タイマー終了
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (focusMode === 'work') {
              setFocusSessions(s => s + 1);
              setFocusMode('break');
              setFocusMinutesLeft(5); // 5分休憩
              Alert.alert('集中完了！', '5分間の休憩に入る。', [{ text: '了解' }]);
            } else {
              setFocusMode('work');
              setFocusMinutesLeft(25); // 25分集中
              Alert.alert('休憩終了', '再び集中せよ。', [{ text: '了解' }]);
            }
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft, focusMode]);

  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            clearInterval(timer);
            setFocusTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const messages = [
              'よくやった。武士の集中力だ。',
              '見事。この調子で進め。',
              '集中完了。次の戦いに備えよ。',
              '時間を制した者が、己を制す。',
            ];
            triggerYokaiDefeat('focus', 20);
            Alert.alert('集中完了', messages[Math.floor(Math.random() * messages.length)], [
              { text: '道場に戻る', onPress: () => {
                setShowStartScreen(true);
                setShowFocusEntry(true);
                setFocusType('select');
              }}
            ]);
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft]);

  // 集中タブ
  const isUrlBlocked = (url: string) => {
    return blockedSites.some(site => url.toLowerCase().includes(site.toLowerCase()));
  };

  const containsNgWord = (url: string) => {
    const decoded = decodeURIComponent(url).toLowerCase();
    return ngWords.some(word => decoded.includes(word.toLowerCase()));
  };

  const startNgQuiz = (url: string) => {
    setPendingUrl(url);
    setNgQuizRemaining(ngLevel);
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentNgQ(randomQ);
    setNgAnswer('');
    setShowNgQuiz(true);
  };

  const handleNgQuizAnswer = () => {
    if (ngAnswer.trim().toLowerCase() === currentNgQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const remaining = ngQuizRemaining - 1;
      setNgQuizRemaining(remaining);
      
      if (remaining === 0) {
        setShowNgQuiz(false);
        setFocusUrl(pendingUrl);
        setPendingUrl('');
        showSaveSuccess('通過を許可する。');
      } else {
        const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
        setCurrentNgQ(randomQ);
        setNgAnswer('');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '本当に必要な検索か考えよ。');
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentNgQ(randomQ);
      setNgAnswer('');
    }
  };

  const handleStartFocus = () => {
    if (!focusPurpose.trim()) {
      Alert.alert('目的が必要', '何のために開くのか、目的を入力せよ。');
      return;
    }
    playTapSound();
    // ランダムな問題を選択
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentFocusQ(randomQ);
    setFocusQuestionAnswer('');
    setShowFocusQuestion(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFocusQuestionSubmit = () => {
    if (focusQuestionAnswer.trim().toLowerCase() === currentFocusQ.a.toLowerCase()) {
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playFocusStartSound();
      setShowFocusQuestion(false);
      setShowFocusEntry(false);
      setFocusStartTime(new Date());
      setFocusTimerRunning(true);
      markMissionStarted(); // サムライミッション開始判定
      setFocusMinutesLeft(25);
      setFocusSecondsLeft(0);
      setFocusMode('work');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '答えが違う。集中する覚悟はあるか？');
      // 新しい問題に変更
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentFocusQ(randomQ);
      setFocusQuestionAnswer('');
    }
  };

  // キャラクター育成画面




  // ===== Kegare Functions =====
  const checkKegare = async () => {
    try {
      const json = await AsyncStorage.getItem(KEGARE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (json) {
        const data = JSON.parse(json);
        if (data.lastDate === today) {
          setShowKatanaPolish(false);
          return;
        }
        
        const lastDate = new Date(data.lastDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          setLoginStreak((data.streak || 0) + 1);
          setPolishRequired(3);
        } else if (diffDays <= 3) {
          setLoginStreak(1);
          setPolishRequired(5);
        } else if (diffDays <= 7) {
          setLoginStreak(1);
          setPolishRequired(8);
        } else {
          setLoginStreak(1);
          setPolishRequired(12);
        }
      } else {
        setLoginStreak(1);
        setPolishRequired(5);
      }
      
      setPolishCount(0);
      setPolishComplete(false);
      setShowKatanaPolish(true);
      setKegareQuote(KEGARE_QUOTES[Math.floor(Math.random() * KEGARE_QUOTES.length)]);
    } catch (e) {
      console.log('Kegare check error', e);
    }
  };

  const handlePolish = async () => {
    if (polishComplete) return;
    
    const newCount = polishCount + 1;
    setPolishCount(newCount);
    
    try {
      const { sound } = await Audio.Sound.createAsync(SFX_POLISH);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {}
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(katanaScaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(katanaScaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    
    if (newCount >= polishRequired) {
      setPolishComplete(true);
      
      try {
        const { sound } = await Audio.Sound.createAsync(SFX_KATANA_SHINE);
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s: any) => {
          if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
        });
      } catch (e) {}
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(katanaGlowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(katanaGlowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
      
      const streakXp = loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5;
      await addXpWithLevelCheck(streakXp);
      
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(KEGARE_KEY, JSON.stringify({
        lastDate: today,
        streak: loginStreak,
      }));
    }
  };

  const dismissKatanaPolish = () => {
    setShowKatanaPolish(false);
    katanaGlowAnim.setValue(0);
    katanaScaleAnim.setValue(1);
  };

  // ===== Yokai Encounter Functions =====
  const triggerYokaiDefeat = (feature: YokaiFeature, xpGain: number) => {
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature));
    if (pool.length === 0) return;
    const yokai = pool[Math.floor(Math.random() * pool.length)];
    setYokaiEncounter(yokai);
    setYokaiPhase('appear');
    setYokaiXp(xpGain);
    setYokaiFeature(feature);
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Shake animation
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXpWithLevelCheck(yokaiXp);
    }, 1200);
  };

  const closeYokaiModal = () => {
    setYokaiEncounter(null);
    setYokaiPhase(null);
    setYokaiXp(0);
    yokaiShakeAnim.setValue(0);
  };

  // ===== Stats Functions =====
  const saveStats = async (stats: any, allocated: boolean, realloc: string | null) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
        stats, allocated, lastRealloc: realloc
      }));
    } catch (e) { console.log('Stats save error', e); }
  };

  const confirmStatsAllocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    setSamuraiStats(tempStats);
    setStatsAllocated(true);
    setShowStatsAlloc(false);
    await saveStats(tempStats, true, lastRealloc);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('武士の器、定まれり');
  };

  const canReallocate = () => {
    if (!lastRealloc) return true;
    const last = new Date(lastRealloc);
    const now = new Date();
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  };

  const startReallocation = () => {
    if (!canReallocate()) {
      showSaveSuccess('月に一度のみ再配分可能');
      return;
    }
    setTempStats({...samuraiStats});
    setShowReallocModal(true);
  };

  const confirmReallocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    const diff = Math.abs(tempStats.power - samuraiStats.power) + Math.abs(tempStats.mind - samuraiStats.mind) + Math.abs(tempStats.skill - samuraiStats.skill) + Math.abs(tempStats.virtue - samuraiStats.virtue);
    if (diff > reallocBudget * 2) {
      showSaveSuccess('最大' + reallocBudget + 'ポイントまで');
      return;
    }
    const now = new Date().toISOString();
    setSamuraiStats(tempStats);
    setLastRealloc(now);
    setShowReallocModal(false);
    await saveStats(tempStats, true, now);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('過去は変えられぬ。だが、解釈は変えられる');
  };

  const adjustTempStat = (key: 'power' | 'mind' | 'skill' | 'virtue', delta: number) => {
    const newVal = tempStats[key] + delta;
    if (newVal < 20 || newVal > 100) return;
    const others = Object.entries(tempStats).filter(([k]) => k !== key).reduce((s, [, v]) => s + v, 0);
    if (others + newVal > 300) return;
    setTempStats(prev => ({...prev, [key]: newVal}));
  };

  // ===== Battle System Functions =====
  const getAvailableEnemies = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const lv = Math.max(1, levelInfo.level);
    return ENEMIES.filter(e => lv >= e.minLv && lv <= e.maxLv);
  };

  const shakeAnimation = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const startBattle = (enemy: any) => {
    setBattleEnemy(enemy);
    setBattleMode('fighting');
    setPlayerHp(100);
    setEnemyHp(100);
    setBattleTurnLog([]);
    setBattleResult(null);
    setBattleAnimating(false);
    setBattleXpGained(0);
    setTab('battle');
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const executeBattleTurn = async () => {
    if (battleAnimating || !battleEnemy) return;
    setBattleAnimating(true);

    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const levelInfo = getLevelFromXp(totalXp);
    const playerLevel = Math.max(1, levelInfo.level);

    const playerAtk = playerLevel * 8 + Math.floor(samuraiStats.power * 0.3) + Math.floor(Math.random() * 15) + 5;
    const enemyAtk = battleEnemy.power * 0.7 + Math.floor(Math.random() * battleEnemy.power * 0.4);

    const dmgToEnemy = Math.max(8, Math.round(playerAtk - battleEnemy.power * 0.2));
    const dmgToPlayer = Math.max(5, Math.round(enemyAtk - playerLevel * 2));

    shakeAnimation(battleShakeAnim);

    const newEnemyHp = Math.max(0, enemyHp - dmgToEnemy);
    setEnemyHp(newEnemyHp);

    const turnText = '⚔️ ' + dmgToEnemy + 'ダメージ！';
    setBattleTurnLog(prev => [...prev, turnText]);

    setTimeout(() => {
      shakeAnimation(playerShakeAnim);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newPlayerHp = Math.max(0, playerHp - dmgToPlayer);
      setPlayerHp(newPlayerHp);

      const enemyTurnText = '🔥 ' + battleEnemy.name + 'の反撃！ ' + dmgToPlayer + 'ダメージ';
      setBattleTurnLog(prev => [...prev, enemyTurnText]);

      if (newEnemyHp <= 0) {
        setBattleResult('win');
        setBattleMode('result');
        const baseXp = battleEnemy.isBoss ? 50 : 25;
        const streakBonus = battleWinStreak >= 5 ? 25 : battleWinStreak >= 3 ? 15 : battleWinStreak >= 1 ? 5 : 0;
        const totalGain = baseXp + streakBonus;
        setBattleXpGained(totalGain);
        setBattleQuote(BATTLE_WIN_QUOTES[Math.floor(Math.random() * BATTLE_WIN_QUOTES.length)]);
        setBattleWinStreak(prev => prev + 1);
        addXpWithLevelCheck(totalGain);
        playWinSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (newPlayerHp <= 0) {
        setBattleResult('lose');
        setBattleMode('result');
        setBattleXpGained(5);
        setBattleQuote(BATTLE_LOSE_QUOTES[Math.floor(Math.random() * BATTLE_LOSE_QUOTES.length)]);
        setBattleWinStreak(0);
        addXpWithLevelCheck(5);
        playFailSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setBattleAnimating(false);
    }, 800);
  };

  const renderBattleTab = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const characterImage = CHARACTER_IMAGES[Math.max(1, Math.min(10, levelInfo.level))] || CHARACTER_IMAGES[1];

    if (battleMode === 'select' || battleMode === null) {
      const available = getAvailableEnemies();
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            修行対戦
          </Text>
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
            己の力を試せ
          </Text>

          {battleWinStreak > 0 && (
            <View style={{ backgroundColor: '#2a1a00', borderRadius: 8, padding: 10, marginBottom: 16, alignItems: 'center' }}>
              <Text style={{ color: '#D4AF37', fontSize: 14, fontWeight: '600' }}>
                🔥 {battleWinStreak}連勝中！
              </Text>
            </View>
          )}

          {available.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>修行を積み、レベルを上げよ</Text>
            </View>
          ) : (
            available.map((enemy, idx) => (
              <Pressable
                key={enemy.id}
                onPress={() => startBattle(enemy)}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: pressed ? '#2a2a3e' : (enemy.isBoss ? '#1a0a1a' : '#1a1a2e'),
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: enemy.isBoss ? 2 : 1,
                  borderColor: enemy.isBoss ? '#8B0000' : '#333',
                }]}
              >
                <View style={{
                  width: 70, height: 70, borderRadius: 12, overflow: 'hidden',
                  borderWidth: 2, borderColor: enemy.isBoss ? '#8B0000' : '#D4AF37',
                  backgroundColor: '#0a0a1a',
                }}>
                  <Image source={enemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {enemy.isBoss && <Text style={{ color: '#8B0000', fontSize: 12, marginRight: 6 }}>
                      👹 BOSS</Text>}
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{enemy.name}</Text>
                  </View>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    「{enemy.quote}」
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <Text style={{ color: '#D4AF37', fontSize: 12 }}>
                      戦力: {'⚔️'.repeat(Math.ceil(enemy.power / 25))}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#D4AF37', fontSize: 20 }}>⚔️</Text>
              </Pressable>
            ))
          )}

          <Pressable
            onPress={() => { playTapSound(); setTab('character'); setBattleMode(null); }}
            style={{ marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center' }}
          >
            <Text style={{ color: '#888', fontSize: 14 }}>育成画面に戻る</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (battleMode === 'fighting' && battleEnemy) {
      return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {battleEnemy.isBoss && <Text style={{ color: '#8B0000', fontSize: 14, marginRight: 6 }}>👹</Text>}
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{battleEnemy.name}</Text>
            </View>
            <View style={{ width: '80%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <View style={{ height: '100%', width: Math.max(0, enemyHp) + '%', backgroundColor: enemyHp > 50 ? '#ef4444' : enemyHp > 25 ? '#f59e0b' : '#dc2626', borderRadius: 5 }} />
            </View>
            <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>HP: {enemyHp}/100</Text>

            <Animated.View style={{
              transform: [{ translateX: battleShakeAnim }],
              width: 160, height: 160, borderRadius: 16, overflow: 'hidden',
              borderWidth: 3, borderColor: battleEnemy.isBoss ? '#8B0000' : '#ef4444',
              backgroundColor: '#1a1a2e',
            }}>
              <Image source={battleEnemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </Animated.View>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Text style={{ color: '#D4AF37', fontSize: 32, fontWeight: '900' }}>⚔️ VS ⚔️</Text>
            {battleTurnLog.length > 0 && (
              <View style={{ marginTop: 8, maxHeight: 60 }}>
                {battleTurnLog.slice(-2).map((log, i) => (
                  <Text key={i} style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>{log}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Animated.View style={{
              transform: [{ translateX: playerShakeAnim }],
              width: 130, height: 130, borderRadius: 16, overflow: 'hidden',
              borderWidth: 3, borderColor: '#D4AF37',
              backgroundColor: '#1a1a2e',
            }}>
              <Image source={characterImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </Animated.View>
            <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 8 }}>HP: {playerHp}/100</Text>
            <View style={{ width: '80%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden', marginTop: 4 }}>
              <View style={{ height: '100%', width: Math.max(0, playerHp) + '%', backgroundColor: playerHp > 50 ? '#22c55e' : playerHp > 25 ? '#f59e0b' : '#ef4444', borderRadius: 5 }} />
            </View>
            <Text style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
              Lv.{levelInfo.level} {levelInfo.title}
            </Text>
          </View>

          <Pressable
            onPress={executeBattleTurn}
            disabled={battleAnimating}
            style={({ pressed }) => [{
              backgroundColor: battleAnimating ? '#444' : (pressed ? '#8B6914' : '#D4AF37'),
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
              marginTop: 12,
              opacity: battleAnimating ? 0.6 : 1,
            }]}
          >
            <Text style={{ color: battleAnimating ? '#888' : '#000', fontSize: 22, fontWeight: '900' }}>
              {battleAnimating ? '...' : '⚔️ 斬る！'}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (battleMode === 'result' && battleEnemy) {
      const won = battleResult === 'win';
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{
            fontSize: 48, fontWeight: '900',
            color: won ? '#D4AF37' : '#ef4444',
            marginBottom: 16,
          }}>
            {won ? '勝利' : '敗北'}
          </Text>

          <View style={{
            width: 120, height: 120, borderRadius: 16, overflow: 'hidden',
            borderWidth: 3, borderColor: won ? '#D4AF37' : '#555',
            backgroundColor: '#1a1a2e', marginBottom: 20,
            opacity: won ? 0.6 : 1,
          }}>
            <Image source={battleEnemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>

          <Text style={{ color: '#888', fontSize: 16, marginBottom: 4 }}>
            {won ? battleEnemy.name + 'を倒した' : battleEnemy.name + 'に敗れた'}
          </Text>

          <View style={{
            backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20,
            marginVertical: 20, width: '100%',
            borderLeftWidth: 3, borderLeftColor: '#D4AF37',
          }}>
            <Text style={{ color: '#D4AF37', fontSize: 12, marginBottom: 8 }}>サムライキングの言葉</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontStyle: 'italic', lineHeight: 24 }}>
              「{battleQuote}」
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold' }}>
              +{battleXpGained} XP
            </Text>
            {battleWinStreak > 1 && won && (
              <Text style={{ color: '#f59e0b', fontSize: 14, marginLeft: 8 }}>
                🔥 {battleWinStreak}連勝ボーナス！
              </Text>
            )}
          </View>
          {!won && (
            <Text style={{ color: '#666', fontSize: 12 }}>敗北でも5XP獲得</Text>
          )}

          <View style={{ width: '100%', marginTop: 24 }}>
            <Pressable
              onPress={() => { playTapSound(); setBattleMode('select'); setTab('battle'); }}
              style={{ backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>もう一度対戦する</Text>
            </Pressable>
            <Pressable
              onPress={() => { playTapSound(); setTab('character'); setBattleMode(null); }}
              style={{ borderWidth: 1, borderColor: '#444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>育成画面に戻る</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderCharacterTab = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const characterImage = CHARACTER_IMAGES[Math.max(1, Math.min(10, levelInfo.level))] || CHARACTER_IMAGES[1];
    
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          サムライ育成
        </Text>
        
        {/* キャラクター画像 */}
        <View style={{ 
          width: 250, 
          height: 250, 
          borderRadius: 20, 
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: '#D4AF37',
          marginVertical: 20,
          backgroundColor: '#1a1a2e',
        }}>
          <Image 
            source={characterImage} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        
        {/* レベルと称号 */}
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
          Lv.{levelInfo.level}
        </Text>
        <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '600', marginTop: 4 }}>
          {levelInfo.title}
        </Text>
        
        {/* EXPバー */}
        <View style={{ width: '100%', marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#888', fontSize: 14 }}>EXP</Text>
            <Text style={{ color: '#888', fontSize: 14 }}>
              {levelInfo.level >= 10 ? 'MAX' : `${levelInfo.xpInLevel} / ${levelInfo.xpForLevel}`}
            </Text>
          </View>
          <View style={{ 
            height: 12, 
            backgroundColor: '#333', 
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            <View style={{ 
              height: '100%', 
              width: `${levelInfo.progress * 100}%`,
              backgroundColor: '#D4AF37',
              borderRadius: 6,
            }} />
          </View>
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            総EXP: {totalXp}
          </Text>
        </View>
        
        {/* ステータス表示 */}
        <View style={{ marginTop: 28, width: '100%', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700' }}>武士の器</Text>
            {statsAllocated && canReallocate() && (
              <Pressable onPress={startReallocation}>
                <Text style={{ color: '#888', fontSize: 12 }}>再配分</Text>
              </Pressable>
            )}
          </View>
          
          {!statsAllocated && levelInfo.level >= 1 ? (
            <Pressable
              onPress={() => { setTempStats({power: 75, mind: 75, skill: 75, virtue: 75}); setShowStatsAlloc(true); playTapSound(); }}
              style={{ backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>ステータスを配分する</Text>
              <Text style={{ color: '#333', fontSize: 12, marginTop: 4 }}>300ポイントを自由に配分</Text>
            </Pressable>
          ) : statsAllocated ? (
            <View>
              {[
                {key: 'power', label: '力', color: '#ef4444', icon: '⚔️'},
                {key: 'mind', label: '心', color: '#3b82f6', icon: '🧘'},
                {key: 'skill', label: '技', color: '#22c55e', icon: '🎯'},
                {key: 'virtue', label: '徳', color: '#a855f7', icon: '✨'},
              ].map(stat => (
                <View key={stat.key} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>
                      {stat.icon} {stat.label}
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 15, fontWeight: 'bold' }}>
                      {samuraiStats[stat.key as keyof typeof samuraiStats]}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: samuraiStats[stat.key as keyof typeof samuraiStats] + '%', backgroundColor: stat.color, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
              <Text style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                合計: {samuraiStats.power + samuraiStats.mind + samuraiStats.skill + samuraiStats.virtue} / 300
              </Text>
            </View>
          ) : (
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Lv.1で解放</Text>
          )}
        </View>

        {/* レベル別解放要素 */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 12, width: '100%' }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            解放済み能力
          </Text>
          {[
            { lv: 1, label: 'サムライ相談', icon: '💬' },
            { lv: 1, label: 'ステータス配分', icon: '📊' },
            { lv: 2, label: 'サムライミッション', icon: '🎯' },
            { lv: 3, label: '修行対戦', icon: '⚔️' },
            { lv: 3, label: '鬼コーチモード', icon: '🔥' },
            { lv: 5, label: 'サムライアラーム', icon: '⏰' },
            { lv: 7, label: 'ドラゴンボス挑戦', icon: '🐉' },
            { lv: 9, label: '覚醒の扉', icon: '🌊' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, width: 28 }}>{item.icon}</Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#ccc' : '#444', fontSize: 14, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#22c55e' : '#555', fontSize: 12 }}>
                {levelInfo.level >= item.lv ? '✅' : 'Lv.' + item.lv}
              </Text>
            </View>
          ))}
          {levelInfo.level < 10 && (
            <Text style={{ color: '#555', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
              次のレベルまで: {levelInfo.nextLevelXp - totalXp} XP
            </Text>
          )}
        </View>
        
        {/* 進化プレビュー */}
        {levelInfo.level < 10 && (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>次の姿</Text>
            <View style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#333',
              opacity: 0.5,
            }}>
              <Image 
                source={CHARACTER_IMAGES[Math.min(10, levelInfo.level + 1)]} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
              {LEVEL_TITLES[levelInfo.level + 1]}
            </Text>
          </View>
        )}

        {/* Battle Arena Section */}
        {(isPro || levelInfo.level >= 3) && (
          <View style={{ marginTop: 32, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#8B0000', fontSize: 16, fontWeight: '900', marginHorizontal: 12 }}>☠️ 対戦場 ☠️</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {getAvailableEnemies().map((enemy) => (
                <Pressable
                  key={enemy.id}
                  onPress={() => startBattle(enemy)}
                  style={({ pressed }) => [{
                    width: '48%',
                    backgroundColor: pressed ? '#2a0a0a' : '#0a0a1a',
                    borderRadius: 14,
                    padding: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: enemy.isBoss ? '#8B0000' : '#222',
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View style={{
                    width: 70, height: 70, borderRadius: 12, overflow: 'hidden',
                    borderWidth: 2, borderColor: enemy.isBoss ? '#8B0000' : '#333',
                    backgroundColor: '#0a0a0a',
                  }}>
                    <Image source={enemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </View>
                  {enemy.isBoss && (
                    <Text style={{ color: '#8B0000', fontSize: 9, fontWeight: '900', marginTop: 4 }}>👹 BOSS</Text>
                  )}
                  <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{enemy.name}</Text>
                  <Text style={{ color: '#555', fontSize: 9, fontStyle: 'italic', marginTop: 2, textAlign: 'center' }} numberOfLines={1}>
                    「{enemy.quote}」
                  </Text>
                </Pressable>
              ))}
            </View>

            {battleWinStreak > 0 && (
              <Text style={{ color: '#D4AF37', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                🔥 {battleWinStreak}連勝中
              </Text>
            )}
          </View>
        )}

        {!isPro && levelInfo.level < 3 && (
          <View style={{ marginTop: 32, width: '100%', alignItems: 'center', opacity: 0.4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#555', fontSize: 14, marginHorizontal: 12 }}>☠️ 対戦場 ☠️</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>
            <Text style={{ color: '#555', fontSize: 13 }}>🔒 Lv.3「足軽」で解放</Text>
          </View>
        )}

      </ScrollView>
    );
  };

  const renderAlarmTab = () => {
    // アラーム発動中の画面
    if (alarmRinging) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1a0000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ef4444', fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>
            {alarmLevel >= 3 ? '起きろ！！！' : '起きろ。'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 20, marginBottom: 30, textAlign: 'center' }}>
            📸 {alarmMission}を撮影せよ
          </Text>
          <Text style={{ color: '#ef4444', fontSize: 16, marginBottom: 30 }}>
            怒りレベル: {'🔥'.repeat(alarmLevel)}
          </Text>
          <Pressable
            style={{ backgroundColor: '#ef4444', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 12 }}
            onPress={takeMissionPhoto}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>📷 撮影してアラームを止める</Text>
          </Pressable>
        </View>
      );
    }
    
    return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌅 SAMURAI KING ALARM</Text>
        <Text style={styles.goalSub}>カメラで撮影しないと止まらない。逃げ場なし。</Text>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>⏰ 起床時間</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h + 1) % 24); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
            <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h - 1 + 24) % 24); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
          <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>:</Text>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m + 15) % 60); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
            <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m - 15 + 60) % 60); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
        </View>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>📸 撮影ミッション</Text>
        <Text style={styles.goalSub}>この場所を撮影しないとアラームが止まらない</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => { playTapSound(); setAlarmMission(m); }}
              style={{
                backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginHorizontal: 4,
              }}
            >
              <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold' }}>{m}</Text>
            </Pressable>
          ))}
        </View>
        
        <Pressable
          style={[styles.primaryButton, { marginTop: 24, backgroundColor: alarmSet ? '#ef4444' : '#2DD4BF' }]}
          onPress={async () => {
            playTapSound();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (!alarmSet) {
              // アラームをセット：通知をスケジュール
              const now = new Date();
              let triggerDate = new Date();
              triggerDate.setHours(alarmHour, alarmMinute, 0, 0);
              
              // 設定時刻が過去なら翌日に
              if (triggerDate <= now) {
                triggerDate.setDate(triggerDate.getDate() + 1);
              }
              
              // 既存の通知をキャンセル
              if (alarmNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(alarmNotificationId);
              }
              
              // 新しい通知をスケジュール
              const notifId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: '⚔️ サムライキング参上',
                  body: `起きろ！${alarmMission}を撮影して目を覚ませ！`,
                  sound: true,
                  data: { type: 'wakeup_alarm' },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: triggerDate,
                },
              });
              setAlarmNotificationId(notifId);
              setAlarmSet(true);
              Alert.alert('アラーム設定完了', 
                alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\n撮影場所：' + alarmMission);
            } else {
              // アラームを解除
              if (alarmNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(alarmNotificationId);
                setAlarmNotificationId(null);
              }
              setAlarmSet(false);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>{alarmSet ? 'アラーム解除' : 'アラームを設定'}</Text>
        </Pressable>
        
        {alarmSet && (
          <Text style={{ color: '#2DD4BF', textAlign: 'center', marginTop: 12 }}>
            ⏰ {alarmHour}:{String(alarmMinute).padStart(2, '0')} にセット済み
          </Text>
        )}
        
        {/* テスト用ボタン */}
        <Pressable
          style={[styles.secondaryButton, { marginTop: 20 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            startAlarmShout();
          }}
        >
          <Text style={styles.secondaryButtonText}>🔔 テスト：アラームを鳴らす</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
  };

  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {/* モード選択画面 */}
      {focusType === 'select' && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>集中</Text>
          <Text style={styles.focusQuestion}>何に集中する？</Text>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              playTapSound();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('net');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>🌐</Text>
            <Text style={styles.focusTypeButtonText}>ネットを使う</Text>
            <Text style={styles.focusTypeButtonSub}>封印サイト・NGワード監視付き</Text>
          </Pressable>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              playTapSound();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('study');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>📚</Text>
            <Text style={styles.focusTypeButtonText}>勉強する</Text>
            <Text style={styles.focusTypeButtonSub}>タイマーで集中管理</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード設定 */}
      {focusType === 'study' && showFocusEntry && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>勉強タイマー</Text>
          <Text style={styles.focusQuestion}>集中せよ。</Text>
          
          <View style={styles.timerSettingSection}>
            <Text style={styles.timerSettingLabel}>集中時間</Text>
            <View style={styles.timerButtons}>
              {[15, 25, 45, 60].map(min => (
                <Pressable
                  key={min}
                  style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                  onPress={() => setFocusDuration(min)}
                >
                  <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              playFocusStartSound();
              setShowFocusEntry(false);
              setFocusTimerRunning(true);
              markMissionStarted(); // サムライミッション開始判定
              setFocusMinutesLeft(focusDuration);
              setFocusSecondsLeft(0);
            }}
          >
            <Text style={styles.primaryButtonText}>開始</Text>
          </Pressable>
          
          <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
            <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード実行中 */}
      {focusType === 'study' && !showFocusEntry && (
        <View style={styles.studyTimerScreen}>
          <Text style={styles.studyTimerLabel}>集中中</Text>
          <Text style={styles.studyTimerDisplay}>
            {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
          </Text>
          <View style={styles.studyTimerControls}>
            <Pressable
              style={styles.studyControlButton}
              onPress={() => setFocusTimerRunning(!focusTimerRunning)}
            >
              <Text style={styles.studyControlText}>{focusTimerRunning ? '一時停止' : '再開'}</Text>
            </Pressable>
            <Pressable
              style={[styles.studyControlButton, { backgroundColor: '#333' }]}
              onPress={() => {
                Alert.alert('終了する？', '集中を終了しますか？', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '終了', style: 'destructive', onPress: () => {
                    setFocusTimerRunning(false);
                    setShowFocusEntry(true);
                    setFocusType('select');
                    setShowStartScreen(true);
                  }}
                ]);
              }}
            >
              <Text style={styles.studyControlText}>終了</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ネットモード設定 */}
      {focusType === 'net' && showFocusEntry && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>ネット</Text>
            <Text style={styles.focusQuestion}>必要な検索だけせよ。</Text>
            <Text style={styles.goalSub}>封印サイト→ブロック / NGワード→問題{ngLevel}問</Text>
            
            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>制限時間</Text>
              <View style={styles.timerButtons}>
                {[15, 25, 45, 60].map(min => (
                  <Pressable
                    key={min}
                    style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                    onPress={() => setFocusDuration(min)}
                  >
                    <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>NGワード問題数</Text>
              <View style={styles.timerButtons}>
                {[3, 5, 10].map(num => (
                  <Pressable
                    key={num}
                    style={[styles.timerButton, ngLevel === num && styles.timerButtonActive]}
                    onPress={() => setNgLevel(num as 3 | 5 | 10)}
                  >
                    <Text style={[styles.timerButtonText, ngLevel === num && styles.timerButtonTextActive]}>{num}問</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                playFocusStartSound();
                setShowFocusEntry(false);
                setFocusTimerRunning(true);
                markMissionStarted(); // サムライミッション開始判定
                setFocusMinutesLeft(focusDuration);
                setFocusSecondsLeft(0);
                setFocusUrl('https://www.google.com');
              }}
            >
              <Text style={styles.primaryButtonText}>ブラウザを開く</Text>
            </Pressable>
            
            <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
              <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
            </Pressable>
            
            {/* 封印サイト管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>🚫 封印サイト（完全ブロック）</Text>
              {blockedSites.map((site, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{site}</Text>
                  <Pressable onPress={() => setBlockedSites(blockedSites.filter((_, i) => i !== index))}>
                    <Text style={styles.removeSiteText}>解除</Text>
                  </Pressable>
                </View>
              ))}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.addSiteInput}
                  value={newBlockedSite}
                  onChangeText={setNewBlockedSite}
                  placeholder="サイトを追加..."
                  placeholderTextColor="#6b7280"
                />
                <Pressable style={styles.addSiteButton} onPress={() => {
                  if (newBlockedSite.trim()) {
                    setBlockedSites([...blockedSites, newBlockedSite.trim()]);
                    setNewBlockedSite('');
                  }
                }}>
                  <Text style={styles.addSiteButtonText}>封印</Text>
                </Pressable>
              </View>
            </View>

            {/* NGワード管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>⚠️ NGワード（問題で通過）</Text>
              {ngWords.map((word, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{word}</Text>
                  <Pressable onPress={() => setNgWords(ngWords.filter((_, i) => i !== index))}>
                    <Text style={styles.removeSiteText}>削除</Text>
                  </Pressable>
                </View>
              ))}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.addSiteInput}
                  value={newNgWord}
                  onChangeText={setNewNgWord}
                  placeholder="NGワードを追加..."
                  placeholderTextColor="#6b7280"
                />
                <Pressable style={styles.addSiteButton} onPress={() => {
                  if (newNgWord.trim()) {
                    setNgWords([...ngWords, newNgWord.trim()]);
                    setNewNgWord('');
                  }
                }}>
                  <Text style={styles.addSiteButtonText}>追加</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ネットモード実行中（ブラウザ） */}
      {focusType === 'net' && !showFocusEntry && (
        <View style={{ flex: 1 }}>
          <View style={styles.focusTopBar}>
            <Pressable onPress={() => {
              Alert.alert('終了する？', 'ネット利用を終了しますか？', [
                { text: 'キャンセル', style: 'cancel' },
                { text: '終了', style: 'destructive', onPress: () => {
                  setFocusTimerRunning(false);
                  setShowFocusEntry(true);
                  setFocusType('select');
                  setShowStartScreen(true);
                }}
              ]);
            }}>
              <Text style={styles.focusEndText}>終了</Text>
            </Pressable>
            <View style={styles.focusTimerBox}>
              <Text style={styles.focusTimerText}>
                {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
              </Text>
            </View>
            <Pressable onPress={() => setFocusTimerRunning(!focusTimerRunning)}>
              <Text style={styles.focusTimerControl}>{focusTimerRunning ? '⏸' : '▶️'}</Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: focusUrl }}
            style={{ flex: 1 }}
            onShouldStartLoadWithRequest={(request) => {
              if (isUrlBlocked(request.url)) {
                Alert.alert('封印されたサイト', 'このサイトは開けない。');
                return false;
              }
              if (containsNgWord(request.url)) {
                startNgQuiz(request.url);
                return false;
              }
              return true;
            }}
          />
        </View>
      )}

      {/* NGワード問題モーダル */}
      <Modal visible={showNgQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.ngQuizTitle}>⚠️ NGワード検出</Text>
            <Text style={styles.ngQuizSub}>この先に行きたいなら問題に答えよ</Text>
            <Text style={styles.ngQuizRemaining}>残り {ngQuizRemaining} 問</Text>
            
            <View style={styles.focusQBox}>
              <Text style={styles.focusQText}>{currentNgQ.q}</Text>
            </View>
            
            <TextInput
              style={styles.quizInput}
              value={ngAnswer}
              onChangeText={setNgAnswer}
              placeholder="Answer..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoFocus
            />
            
            <Pressable style={styles.quizSubmitButton} onPress={handleNgQuizAnswer}>
              <Text style={styles.quizSubmitText}>回答</Text>
            </Pressable>
            
            <Pressable onPress={() => { setShowNgQuiz(false); setPendingUrl(''); }}>
              <Text style={styles.quizCloseText}>やめる（検索を中止）</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );

  // 感謝タブ
  // 10個達成時にAIが感謝リストを見て感想を生成
  const generateGratitudeComment = async (list: string[]) => {
    // 10個達成の特別演出
    playRitualSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoadingGratitudeComment(true);
    try {
      const gratitudeText = list.join('、');
      const res = await fetch('https://bushido-log-server.onrender.com/api/gratitude-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gratitudes: gratitudeText }),
      });
      const data = await res.json();
      if (data.comment) {
        setGratitudeAiComment(data.comment);
      } else {
        setGratitudeAiComment('10個達成だ。よくやった。今日はもう勝っている。');
      }
    } catch {
      setGratitudeAiComment('10個達成だ。よくやった。今日はもう勝っている。');
    }
    setIsLoadingGratitudeComment(false);
  };

  // AIが感謝に反応するフレーズ
  const gratitudeResponses = [
    (text: string) => `「${text.slice(0, 10)}」か。良いことに気づいたな。`,
    (text: string) => `その感謝、心に刻め。`,
    (text: string) => `小さなことに感謝できる者は強い。`,
    (text: string) => `「${text.slice(0, 10)}」。忘れるな。`,
    (text: string) => `感謝は武士の基本だ。よくやった。`,
    (text: string) => `その気づき、大事にせよ。`,
    (text: string) => `一つ一つの感謝が、お前を強くする。`,
    (text: string) => `良い目を持っているな。`,
    (text: string) => `感謝できる心、それが武士道だ。`,
    (text: string) => `その調子だ。続けよ。`,
  ];

  // 1日1善: 読み込み
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(GOOD_DEED_KEY);
        if (saved) {
          const list: GoodDeedEntry[] = JSON.parse(saved);
          // 今日の分だけフィルタ
          const today = getTodayStr();
          const todayDeeds = list.filter(d => d.date.startsWith(today));
          setGoodDeedList(todayDeeds);
        }
      } catch {}
    })();
  }, []);

  // 1日1善: 画像選択
  const pickGoodDeedImage = async () => {
    playTapSound();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setGoodDeedImage(result.assets[0].uri);
    }
  };

  // 1日1善: カメラ撮影
  const takeGoodDeedPhoto = async () => {
    playTapSound();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('カメラの許可が必要です');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setGoodDeedImage(result.assets[0].uri);
    }
  };

  // 1日1善: 保存
  const handleSaveGoodDeed = async () => {
    if (!goodDeedText.trim()) return;
    // 無料ユーザーは1日1件まで
    if (!isPro && goodDeedList.length >= 1) {
      showSaveSuccess('Proなら無制限に記録できる');
      return;
    }
    const entry: GoodDeedEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: goodDeedText.trim(),
      imageUri: goodDeedImage || undefined,
      tag: goodDeedTag || undefined,
    };
    const newList = [...goodDeedList, entry];
    setGoodDeedList(newList);
    // 全履歴を保存
    try {
      const saved = await AsyncStorage.getItem(GOOD_DEED_KEY);
      const allList: GoodDeedEntry[] = saved ? JSON.parse(saved) : [];
      allList.push(entry);
      await AsyncStorage.setItem(GOOD_DEED_KEY, JSON.stringify(allList));
    } catch {}
    setGoodDeedText('');
    setGoodDeedImage(null);
    setGoodDeedTag('');
    showSaveSuccess('善行を記録した。続けよ。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 善行を日記に追加
  const addGoodDeedToDiary = async (deed: GoodDeedEntry) => {
    const deedText = deed.tag ? `【${deed.tag}】${deed.text}` : deed.text;
    await upsertTodayLog(prev => {
      const currentDeeds = prev?.goodDeeds || [];
      return {
        date: getTodayStr(),
        mission: prev?.mission || '',
        routines: prev?.routines || [],
        todos: prev?.todos || [],
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted,
        routineDone: prev?.routineDone || [],
        review: prev?.review,
        goodDeeds: [...currentDeeds, deedText],
      };
    });
    showSaveSuccess('日記に追加した。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddGratitude = () => {
    if (!gratitudeInput.trim()) return;
    if (gratitudeList.length >= 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const inputText = gratitudeInput.trim();
    const newList = [...gratitudeList, inputText];
    setGratitudeList(newList);
    setGratitudeInput('');
    
    // AIの反応をトーストで表示（音声なし）
    const response = gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)](inputText);
    showSaveSuccess(response);
    
    if (newList.length === 10) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowGratitudeComplete(true);
        generateGratitudeComment(newList);
      }, 2000);
    }
  };

  const renderGratitudeTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>感謝</Text>
        <Text style={styles.goalSub}>今日は感謝を10個書けるか？</Text>
        
        <Text style={styles.gratitudeProgress}>{gratitudeList.length} / 10</Text>
        
        {gratitudeList.length < 10 ? (
          <>
            <TextInput
              style={styles.gratitudeInput}
              value={gratitudeInput}
              onChangeText={setGratitudeInput}
              placeholder="感謝を1つ書く..."
              placeholderTextColor="#6b7280"
              onSubmitEditing={handleAddGratitude}
              returnKeyType="done"
            />
            <Pressable style={styles.primaryButton} onPress={handleAddGratitude}>
              <Text style={styles.primaryButtonText}>追加</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.gratitudeCompleteBox}>
            <Text style={styles.gratitudeCompleteTitle}>🎉 10個達成！</Text>
            {isLoadingGratitudeComment ? (
              <Text style={styles.gratitudeCompleteText}>侍キングが感想を考え中...</Text>
            ) : (
              <Text style={styles.gratitudeCompleteText}>{gratitudeAiComment || 'よくやった。今日はもう勝っている。'}</Text>
            )}
            {isPro ? (
              <Pressable
                style={styles.quizButton}
                onPress={() => { playTapSound(); setShowQuiz(true); }}
              >
                <Text style={styles.quizButtonText}>学びのクイズに挑戦</Text>
              </Pressable>
            ) : (
              <Text style={styles.proOnlyText}>Proで学びクイズ解放</Text>
            )}
          </View>
        )}
        
        {gratitudeList.length > 0 && (
          <View style={styles.gratitudeListContainer}>
            {gratitudeList.map((item, index) => (
              <View key={index} style={styles.gratitudeItem}>
                <Text style={styles.gratitudeItemNumber}>{index + 1}.</Text>
                <Text style={styles.gratitudeItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 1日1善セクション */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌟 1日1善</Text>
        <Text style={styles.goalSub}>今日やった良いことを記録せよ</Text>

        {goodDeedImage ? (
          <Pressable style={styles.goodDeedImagePreviewContainer} onPress={pickGoodDeedImage}>
            <Image source={{ uri: goodDeedImage }} style={styles.goodDeedImagePreview} />
          </Pressable>
        ) : (
          <View style={styles.goodDeedImageButtons}>
            <Pressable style={styles.goodDeedCameraBtn} onPress={takeGoodDeedPhoto}>
              <Text style={styles.goodDeedCameraBtnText}>📷 撮影</Text>
            </Pressable>
            <Pressable style={styles.goodDeedGalleryBtn} onPress={pickGoodDeedImage}>
              <Text style={styles.goodDeedGalleryBtnText}>🖼 選択</Text>
            </Pressable>
          </View>
        )}

        <TextInput
          style={styles.goodDeedInput}
          value={goodDeedText}
          onChangeText={setGoodDeedText}
          placeholder="今日やった良いことを書く..."
          placeholderTextColor="#6b7280"
          multiline
        />

        <View style={styles.goodDeedTagRow}>
          {GOOD_DEED_TAGS.map(tag => (
            <Pressable
              key={tag}
              style={[styles.goodDeedTagChip, goodDeedTag === tag && styles.goodDeedTagChipActive]}
              onPress={() => setGoodDeedTag(goodDeedTag === tag ? '' : tag)}
            >
              <Text style={[styles.goodDeedTagText, goodDeedTag === tag && styles.goodDeedTagTextActive]}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.primaryButton, !goodDeedText.trim() && { opacity: 0.5 }]}
          onPress={handleSaveGoodDeed}
          disabled={!goodDeedText.trim()}
        >
          <Text style={styles.primaryButtonText}>善行を記録</Text>
        </Pressable>

        {!isPro && goodDeedList.length >= 1 && (
          <Text style={styles.proOnlyText}>Proなら無制限に記録できる</Text>
        )}

        {goodDeedList.length > 0 && (
          <View style={styles.goodDeedListContainer}>
            <Text style={styles.goodDeedListTitle}>今日の善行</Text>
            {goodDeedList.map((deed) => (
              <View key={deed.id} style={styles.goodDeedItem}>
                {deed.imageUri && (
                  <Image source={{ uri: deed.imageUri }} style={styles.goodDeedItemImage} />
                )}
                <View style={styles.goodDeedItemContent}>
                  <Text style={styles.goodDeedItemText}>{deed.text}</Text>
                  {deed.tag && <Text style={styles.goodDeedItemTag}>#{deed.tag}</Text>}
                  <Pressable style={styles.addToDiaryButton} onPress={() => addGoodDeedToDiary(deed)}>
                    <Text style={styles.addToDiaryButtonText}>📝 日記に追加</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>設定</Text>
        <Text style={styles.goalSub}>サムライキングの声やバイブの強さを、自分好みにカスタムできるでござる。</Text>

        <Text style={styles.sectionTitle}>プラン</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>{isPro ? 'Pro会員' : '無料プラン'}</Text>
            <Text style={styles.settingsHint}>{isPro ? 'サムライキング相談が無制限' : '相談 ' + samuraiKingUses + '/1回使用済み'}</Text>
          </View>
          {!isPro && (
            <Pressable style={styles.proButton} onPress={() => setShowPaywall(true)}>
              <Text style={styles.proButtonText}>Proにする</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.restoreButton} onPress={async () => {
          const success = await restorePurchases();
          if (success) setIsPro(true);
        }}>
          <Text style={styles.restoreButtonText}>購入を復元</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>サムライボイス</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>自動で声を再生する</Text>
            <Text style={styles.settingsHint}>OFFにすると、テキストだけ静かに読むモードになるでござる。</Text>
          </View>
          <Switch value={settings.autoVoice} onValueChange={v => updateSettings({ autoVoice: v })} />
        </View>

        <Text style={[styles.settingsLabel, { marginTop: 8 }]}>読み上げスピード</Text>
        <View style={styles.segmentRow}>
          {[
            { key: 'slow', label: 'ゆっくり' },
            { key: 'normal', label: 'ふつう' },
            { key: 'fast', label: '速め' },
          ].map(opt => {
            const active = settings.readingSpeed === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => updateSettings({ readingSpeed: opt.key as AppSettings['readingSpeed'] })}
              >
                <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>フィードバック</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>バイブ（Haptics）</Text>
            <Text style={styles.settingsHint}>ボタン操作のときに、手応えを少しだけ返すでござる。</Text>
          </View>
          <Switch value={settings.enableHaptics} onValueChange={v => updateSettings({ enableHaptics: v })} />
        </View>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>効果音</Text>
            <Text style={styles.settingsHint}>ボタンを押したときの太鼓の音などをON/OFFできる。</Text>
          </View>
          <Switch value={settings.enableSfx} onValueChange={v => updateSettings({ enableSfx: v })} />
        </View>

        <Text style={styles.sectionTitle}>その他</Text>
        <Pressable style={styles.settingsButton} onPress={resetIntroSkip}>
          <Text style={styles.settingsButtonText}>Introをもう一度表示する</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>サムライキングの厳しさ</Text>
        <View style={styles.segmentRow}>
          {[
            { key: 'soft', label: 'ゆるめ' },
            { key: 'normal', label: 'ふつう' },
            { key: 'hard', label: '鬼コーチ' },
          ].map(opt => {
            const active = settings.strictness === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => updateSettings({ strictness: opt.key as AppSettings['strictness'] })}
              >
                <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>サムライタイム（1日の使用時間制限）</Text>
        <Text style={styles.settingsHint}>このアプリを1日に何分まで使うかを決めるでござる。0分なら無制限。</Text>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>1日の上限（分）</Text>
            <Text style={styles.settingsHint}>例）30なら、今日トータル30分までだけ使える。</Text>
          </View>
          <TextInput
            style={styles.timeInput}
            keyboardType="number-pad"
            value={String(samuraiTime.dailyMinutes ?? 0)}
            onChangeText={updateSamuraiDailyMinutes}
          />
        </View>

        {isTimeLimited && (
          <Text style={styles.settingsHint}>
            今日の使用時間：{usedMinutes} 分 / 上限 {samuraiTime.dailyMinutes} 分{'\n'}
            残り：{remainingMinutes} 分
          </Text>
        )}

        <Text style={styles.sectionTitle}>その他</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setShowPrivacy(true)}>
          <Text style={styles.secondaryButtonText}>プライバシーポリシーを見る</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderOnboarding = () => {
    // Step 1: Welcome（思想のみ）
    if (onboardingStep === 1) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingTitle}>
              漢は、考えすぎると動けなくなる。
            </Text>
            <Text style={styles.newOnboardingTitle}>
              ブシログは、"一歩だけ"を決めるアプリだ。
            </Text>
            <Text style={styles.newOnboardingSubtext}>
              説教しない。監視しない。逃げ道は残す。
            </Text>
          </View>
          <Pressable 
            style={styles.newOnboardingButton} 
            onPress={() => { playTapSound(); setOnboardingStep(2); }}
          >
            <Text style={styles.newOnboardingButtonText}>次へ</Text>
          </Pressable>
        </View>
      );
    }

    // Step 2: 使い方の本質
    if (onboardingStep === 2) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingTitle}>迷ったら、相談する。</Text>
            <Text style={styles.newOnboardingTitle}>決めたら、ミッションにする。</Text>
            <Text style={styles.newOnboardingTitle}>やったら、強くなる。</Text>
            <Text style={styles.newOnboardingSubtext}>
              全部、1〜3分で終わる。
            </Text>
          </View>
          <Pressable 
            style={styles.newOnboardingButton} 
            onPress={() => { playTapSound(); setOnboardingStep(3); }}
          >
            <Text style={styles.newOnboardingButtonText}>わかった</Text>
          </Pressable>
        </View>
      );
    }

    // Step 3: 始め方の選択
    if (onboardingStep === 3) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingQuestion}>どう始める？</Text>
          </View>
          <View style={styles.newOnboardingChoices}>
            <Pressable 
              style={styles.newOnboardingPrimaryChoice} 
              onPress={() => { 
                playTapSound(); 
                setUserStartChoice('free');
                setOnboardingStep(4); 
              }}
            >
              <Text style={styles.newOnboardingChoiceTitle}>まずは無料で試す</Text>
              <Text style={styles.newOnboardingChoiceSub}>3日間、すべての機能を使える</Text>
            </Pressable>
            
            <Pressable 
              style={styles.newOnboardingSecondaryChoice} 
              onPress={() => { 
                playTapSound(); 
                setUserStartChoice('serious');
                setOnboardingStep(4); 
              }}
            >
              <Text style={styles.newOnboardingChoiceTitle2}>最初から本気でいく</Text>
              <Text style={styles.newOnboardingChoiceSub2}>Proモード・鬼コーチ解放</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Step 4: 分岐画面
    if (onboardingStep === 4) {
      if (userStartChoice === 'serious') {
        // 本気を選んだ人
        return (
          <View style={styles.newOnboardingContainer}>
            <View style={styles.newOnboardingContent}>
              <Text style={styles.newOnboardingTitle}>Proモードでは、</Text>
              <Text style={styles.newOnboardingTitle}>相談は無制限。</Text>
              <Text style={styles.newOnboardingTitle}>鬼コーチが選べる。</Text>
              <Text style={styles.newOnboardingTitle}>制限は、なくなる。</Text>
              <Text style={styles.newOnboardingSubtext}>
                いつでも解約できる。
              </Text>
            </View>
            <Pressable 
              style={styles.newOnboardingButton} 
              onPress={async () => { 
                playTapSound();
                await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, choice: 'serious' }));
                setIsOnboarding(false);
                setShowPaywall(true); // Paywall表示
              }}
            >
              <Text style={styles.newOnboardingButtonText}>Proで始める</Text>
            </Pressable>
          </View>
        );
      } else {
        // 無料を選んだ人
        return (
          <View style={styles.newOnboardingContainer}>
            <View style={styles.newOnboardingContent}>
              <Text style={styles.newOnboardingTitle}>3日間、すべて解放する。</Text>
              <Text style={styles.newOnboardingTitle}>合わなければ、消していい。</Text>
            </View>
            <Pressable 
              style={styles.newOnboardingButton} 
              onPress={async () => { 
                playTapSound();
                // 3日間トライアル開始
                const trialStart = new Date().toISOString();
                await AsyncStorage.setItem(FIRST_LAUNCH_KEY, trialStart);
                await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, choice: 'free' }));
                setIsOnboarding(false);
              }}
            >
              <Text style={styles.newOnboardingButtonText}>無料で始める</Text>
            </Pressable>
          </View>
        );
      }
    }

    return null;
  };

  const renderTimeOver = () => (
    <View style={styles.timeOverContainer}>
      <View style={styles.timeOverCard}>
        <Text style={styles.timeOverTitle}>本日のサムライタイム終了</Text>
        <Text style={styles.timeOverText}>
          今日の「BUSHIDO LOG」を使える時間は使い切ったでござる。{'\n'}
          ここから先は、現実世界でサムライミッションを遂行する時間だ。
        </Text>
        <Text style={[styles.timeOverText, { marginTop: 6 }]}>※ 明日になると、時間は自動でリセットされる。</Text>

        <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setTab('settings')}>
          <Text style={styles.primaryButtonText}>サムライタイムの設定を見直す</Text>
        </Pressable>
      </View>
    </View>
  );

  // =========================
  // Loading
  // =========================
  if (isLoadingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DD4BF" />
        <Text style={styles.loadingText}>サムライキングを呼び出し中…</Text>
      </View>
    );
  }

  // Intro画面表示
  if (showIntro) {
    return renderIntroScreen();
  }

  // スタート画面表示（オンボーディング完了後）
  if (showStartScreen && !isOnboarding) {
    return (
      <>
        {renderStartScreen()}
      {/* Katana Polishing Modal */}
      {showKatanaPolish && (
        <Modal visible={true} animationType="fade" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            
            <Text style={{ color: '#8B0000', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
              ── 刀の手入れ ──
            </Text>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', marginBottom: 24 }}>
              {polishComplete ? '磨き上げ完了' : '刃を磨け'}
            </Text>
            
            <Pressable
              onPress={handlePolish}
              disabled={polishComplete}
              style={{ alignItems: 'center' }}
            >
              <Animated.View style={{
                transform: [{ scale: katanaScaleAnim }],
                opacity: katanaGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                }),
              }}>
                <Animated.View style={{
                  shadowColor: '#D4AF37',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: katanaGlowAnim,
                  shadowRadius: 30,
                }}>
                  <Image
                    source={polishComplete ? KATANA_CLEAN : KATANA_RUSTY}
                    style={{ width: 280, height: 280 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>

            {!polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{ width: 200, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{
                    height: '100%',
                    width: (polishCount / polishRequired * 100) + '%',
                    backgroundColor: '#D4AF37',
                    borderRadius: 4,
                  }} />
                </View>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
                  {polishCount} / {polishRequired}
                </Text>
                <Text style={{ color: '#444', fontSize: 12, marginTop: 16 }}>
                  刀をタップして磨け
                </Text>
              </View>
            )}

            {polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  width: '100%',
                  borderLeftWidth: 3,
                  borderLeftColor: '#D4AF37',
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: 12, marginBottom: 4 }}>サムライキングの言葉</Text>
                  <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic' }}>
                    「{kegareQuote}」
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold' }}>
                    +{loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5} XP
                  </Text>
                </View>

                {loginStreak > 1 && (
                  <Text style={{ color: '#f59e0b', fontSize: 14, marginBottom: 16 }}>
                    🔥 {loginStreak}日連続ログイン！
                  </Text>
                )}

                <Pressable
                  onPress={dismissKatanaPolish}
                  style={({ pressed }) => [{
                    backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                    paddingVertical: 18,
                    paddingHorizontal: 50,
                    borderRadius: 14,
                  }]}
                >
                  <Text style={{ color: '#000', fontSize: 18, fontWeight: '900' }}>道場へ</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>
      )}


      </>
    );
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Pressable
                  onPress={() => {
                    playTapSound();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStartScreen(true);
                  }}
                  style={styles.homeButton}
                >
                  <Text style={styles.homeButtonText}>道場に戻る</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    playTapSound();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const levelInfo = getLevelFromXp(totalXp);
                    if (levelInfo.level >= 1) {
                      setTab('character');
                    } else {
                      showSaveSuccess('修行の成果は、やがて姿を持つ');
                    }
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }], alignItems: 'center' }]}
                >
                  <Animated.View style={{ 
                    opacity: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
                    transform: [{ scale: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
                    shadowColor: getLevelFromXp(totalXp).level >= 1 ? '#D4AF37' : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: getLevelFromXp(totalXp).level >= 1 ? 0.8 : 0,
                    shadowRadius: 10,
                  }}>
                    <Image source={require('./assets/icon.png')} style={styles.headerIcon} />
                  </Animated.View>
                </Pressable>
                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
              </View>
            </View>

            {isOnboarding ? (
              renderOnboarding()
            ) : (
              <>

                <View style={{ flex: 1 }}>
                  {isTimeOver && tab !== 'settings' ? (
                    renderTimeOver()
                  ) : (
                    <>
                      {tab === 'consult' && renderConsultTab()}
                      {tab === 'goal' && renderGoalTab()}
                      {tab === 'review' && renderReviewTab()}
                      {tab === 'browser' && renderBrowserTab()}
                      {tab === 'focus' && renderFocusTab()}
                      {tab === 'alarm' && ((isPro || getLevelFromXp(totalXp).level >= 5) ? renderAlarmTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
                          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>サムライアラーム</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.5「若侍」で解放</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>修行を積み、己を磨け</Text>
                        </View>
                      ))}
                      {tab === 'gratitude' && renderGratitudeTab()}
                      {tab === 'settings' && renderSettingsTab()}
                      {tab === 'character' && renderCharacterTab()}
                      {tab === 'battle' && ((isPro || getLevelFromXp(totalXp).level >= 3) ? renderBattleTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
                          <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>修行対戦</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.3「足軽」で解放</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>まずは修行を積め</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </>
            )}
          </View>
      </KeyboardAvoidingView>




      {/* Yokai Defeat Modal */}
      {yokaiEncounter && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { alignItems: 'center', paddingVertical: 30 }]}>

              {yokaiPhase === 'appear' && (
                <>
                  <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>☠️ 妖怪出現！</Text>
                  <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 12 }}>{yokaiEncounter.name}</Text>

                  <View style={{ width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a', marginBottom: 16 }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a0a0a', borderRadius: 12, padding: 14, marginBottom: 20, width: '100%', borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                    <Text style={{ color: '#ef4444', fontSize: 16, fontStyle: 'italic', textAlign: 'center' }}>
                      「{yokaiEncounter.quote}」
                    </Text>
                  </View>

                  <Pressable
                    onPress={yokaiAttack}
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#8B6914' : '#D4AF37', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 14 }]}
                  >
                    <Text style={{ color: '#000', fontSize: 22, fontWeight: '900' }}>⚔️ 斬る！</Text>
                  </Pressable>
                </>
              )}

              {yokaiPhase === 'attack' && (
                <>
                  <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>⚔️ 一太刀！</Text>
                  <Animated.View style={{ transform: [{ translateX: yokaiShakeAnim }], width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a' }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </Animated.View>
                </>
              )}

              {yokaiPhase === 'defeated' && (
                <>
                  <Text style={{ color: '#D4AF37', fontSize: 32, fontWeight: '900', marginBottom: 8 }}>討伐成功！</Text>
                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{yokaiEncounter.name}を倒した！</Text>

                  <View style={{ width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#555', backgroundColor: '#1a0a0a', marginBottom: 16 }}>
                    <Video
                      source={YOKAI_LOSE_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, marginBottom: 16, width: '100%', borderLeftWidth: 3, borderLeftColor: '#D4AF37' }}>
                    <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{yokaiEncounter.name}の最期</Text>
                    <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic', textAlign: 'center' }}>
                      「{yokaiEncounter.defeatQuote}」
                    </Text>
                  </View>

                  <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>+{yokaiXp} XP</Text>

                  <Pressable
                    onPress={closeYokaiModal}
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#8B6914' : '#D4AF37', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14 }]}
                  >
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>続ける</Text>
                  </Pressable>
                </>
              )}

            </View>
          </View>
        </Modal>
      )}

      {/* Stats Allocation Modal */}
      <Modal visible={showStatsAlloc} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              武士の器を定めよ
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              300ポイントを配分せよ（各最低20）
            </Text>

            {[
              {key: 'power', label: '力 (Power)', color: '#ef4444'},
              {key: 'mind', label: '心 (Mind)', color: '#3b82f6'},
              {key: 'skill', label: '技 (Skill)', color: '#22c55e'},
              {key: 'virtue', label: '徳 (Virtue)', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 16, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <View style={{ height: '100%', width: tempStats[stat.key as keyof typeof tempStats] + '%', backgroundColor: stat.color, borderRadius: 3 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>-</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>-1</Text>
                  </Pressable>
                  <View style={{ width: 50, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 11 }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>+1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign: 'center', marginVertical: 12, fontWeight: 'bold' }}>
              合計: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
              {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300 ? ' (調整が必要)' : ' ✅'}
            </Text>

            <Pressable
              onPress={confirmStatsAllocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#000' : '#888', fontSize: 16, fontWeight: 'bold' }}>
                決定する
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowStatsAlloc(false)}
              style={{ padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>戻る</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Reallocation Modal */}
      <Modal visible={showReallocModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              修行回想
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 4, fontStyle: 'italic' }}>
              「過去は変えられぬ。だが、解釈は変えられる」
            </Text>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
              月に一度、最大{reallocBudget}ポイントまで再配分可能
            </Text>

            {[
              {key: 'power', label: '力', color: '#ef4444'},
              {key: 'mind', label: '心', color: '#3b82f6'},
              {key: 'skill', label: '技', color: '#22c55e'},
              {key: 'virtue', label: '徳', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {samuraiStats[stat.key as keyof typeof samuraiStats]} → {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={{ color: '#ccc', fontSize: 18, fontWeight: 'bold' }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              合計: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
            </Text>

            <Pressable
              onPress={confirmReallocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>再配分を確定</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowReallocModal(false)}
              style={{ padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>戻る</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showPrivacy} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>プライバシーポリシー</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.modalText}>{PRIVACY_POLICY_TEXT}</Text>
            </ScrollView>
            <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.primaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>利用規約</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.modalText}>{TERMS_OF_SERVICE_TEXT}</Text>
            </ScrollView>
            <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setShowTerms(false)}>
              <Text style={styles.primaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {renderSaveToast()}
      {renderPaywall()}
      {renderMissionAlarm()}
      {renderAlternativeAction()}
      {renderMissionProposal()}
      
      {/* レベルアップモーダル */}
      <Modal visible={showLevelUpModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, marginBottom: 8 }}>🎊 LEVEL UP! 🎊</Text>
          <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>
            Lv.{levelUpInfo?.newLevel || 1}
          </Text>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>
            {LEVEL_TITLES[levelUpInfo?.newLevel || 1]}
          </Text>
          
          {/* キャラ画像 */}
          <View style={{ 
            width: 200, 
            height: 200, 
            borderRadius: 20, 
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: '#D4AF37',
            marginBottom: 24,
            backgroundColor: '#1a1a2e',
          }}>
            <Image 
              source={CHARACTER_IMAGES[Math.max(1, Math.min(10, levelUpInfo?.newLevel || 1))]} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {levelUpInfo?.newLevel === 1 
              ? 'サムライの姿が目覚めた！\nロゴをタップして育成画面を開こう' 
              : '新たな力を手に入れた！'}
          </Text>
          
          <Pressable
            style={{ backgroundColor: '#D4AF37', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 }}
            onPress={() => {
              playCorrectSound();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowLevelUpModal(false);
            }}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>確認</Text>
          </Pressable>
        </View>
      </Modal>
      
      {/* クイズモーダル */}
      <Modal visible={showQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.quizProgress}>{quizIndex + 1} / {quizData.length}</Text>
            <Text style={styles.quizQuestion}>{quizData[quizIndex].q}</Text>
            
            {quizResult === null ? (
              <>
                <TextInput
                  style={styles.quizInput}
                  value={quizAnswer}
                  onChangeText={setQuizAnswer}
                  placeholder="答えを入力"
                  placeholderTextColor="#666"
                  autoFocus
                />
                <Text style={styles.quizHint}>ヒント: {quizData[quizIndex].hint}</Text>
                <Pressable style={styles.quizSubmitButton} onPress={handleQuizSubmit}>
                  <Text style={styles.quizSubmitText}>回答</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.quizResultText, quizResult === 'correct' ? styles.quizCorrect : styles.quizWrong]}>
                  {quizResult === 'correct' ? '正解！' : '不正解... 答え: ' + quizData[quizIndex].a}
                </Text>
                <Pressable style={styles.quizNextButton} onPress={handleNextQuiz}>
                  <Text style={styles.quizNextText}>{quizIndex < quizData.length - 1 ? '次の問題' : '終了'}</Text>
                </Pressable>
              </>
            )}
            
            <Pressable onPress={() => { playTapSound(); setShowQuiz(false); setQuizIndex(0); setQuizResult(null); }}>
              <Text style={styles.quizCloseText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// =========================
// Styles (complete)
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
  },
  headerSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  timeBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  timeBadgeText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#D4AF37',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#1a1a1a',
  },

  urgeButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  urgeText: {
    color: '#1a1a1a',
    fontWeight: '800',
  },
  caption: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  summonBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    backgroundColor: '#000000',
  },
  summonTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  summonText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  modeRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginRight: 4,
  },
  modeButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  modeButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modeButtonTextActive: {
    color: '#e5e7eb',
    fontWeight: '700',
  },

  chatBox: {
    flex: 1,
    minHeight: 0,

    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 8,
  },
  chatTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  messages: {
    flex: 1,
    marginBottom: 6,
  },
  bubble: {
    maxWidth: '88%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 6,
  },
  userBubble: {
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-end',
  },
  kingBubble: {
    backgroundColor: '#D4AF37',
    alignSelf: 'flex-start',
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    color: '#000000',
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#e5e7eb',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#e5e7eb',
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 12,
  },
  privacyNote: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },

  secondaryButton: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 11,
    color: '#e5e7eb',
  },

  historyInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  historyEntry: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#000000',
  },
  historyDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  historyLabel: {
    fontSize: 11,
    color: '#e5e7eb',
    marginTop: 4,
    fontWeight: '700',
  },
  historyText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  goalCard: {
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginTop: 8,
  },
  goalTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  goalSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  bigInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 56,
    marginTop: 4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  routineChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 4,
    marginBottom: 4,
  },
  routineChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  routineChipText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  routineChipTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  todoInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 48,
  },

  primaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 13,
  },

  questionText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 8,
  },

  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
  },
  progressHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },

  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 4,
  },
  dateChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  dateChipText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dateChipTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },

  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6b7280',
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: '#2DD4BF',
    borderColor: '#2DD4BF',
  },
  todoText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  todoTextDone: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  historyButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  historyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginRight: 4,
  },
  historyDeleteButton: {
    backgroundColor: '#7f1d1d',
    marginLeft: 4,
    marginRight: 0,
  },
  historyButtonText: {
    fontSize: 12,
    color: '#e5e7eb',
    fontWeight: '600',
  },

  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginTop: 8,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  avatarRank: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
  },
  avatarDesc: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  samuraiMissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  samuraiMissionTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  samuraiMissionXp: {
    fontSize: 11,
    color: '#facc15',
    fontWeight: '600',
  },
  samuraiMissionBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginTop: 4,
  },
  samuraiMissionText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 8,
  },
  samuraiMissionButton: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  samuraiMissionButtonText: {
    fontSize: 12,
    color: '#022c22',
    fontWeight: '700',
  },

  samuraiHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  samuraiHeaderTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  samuraiEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  samuraiEditText: {
    fontSize: 11,
    color: '#e5e7eb',
  },

  onboardingLabel: {
    fontSize: 12,
    color: '#e5e7eb',
    marginTop: 8,
    marginBottom: 2,
  },
  onboardingInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 48,
  },
  onboardingButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  onboardingButtonText: {
    fontSize: 13,
    color: '#022c22',
    fontWeight: '700',
  },
  samuraiHeaderLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  samuraiHeaderText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 2,
  },

  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  urlInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#e5e7eb',
    marginRight: 4,
  },
  urlOpenButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  urlOpenButtonText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  browserInfo: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
    marginTop: 10,
  },

  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  blockDomain: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  blockRemove: {
    fontSize: 11,
    color: '#D4AF37',
  },

  browserContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },

  blockedCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  blockedTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  blockedButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  blockedButtonText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '700',
  },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  settingsRowText: {
    flex: 1,
    marginRight: 8,
  },
  settingsLabel: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  settingsHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  segmentRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 6,
    alignItems: 'center',
    marginRight: 4,
  },
  segmentButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  segmentButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  segmentButtonTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },

  timeInput: {
    width: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 13,
    color: '#e5e7eb',
    textAlign: 'center',
  },

  onboardingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  onboardingLead: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
    marginBottom: 8,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#e5e7eb',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 6,
  },
  modalText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  timeOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOverCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
    padding: 16,
    backgroundColor: '#000000',
    width: '100%',
  },
  timeOverTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 8,
  },
  timeOverText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  // スタート画面スタイル
  // Intro画面スタイル
  introScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  introVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  introSkipButton: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 77, 0.5)',
  },
  introSkipButtonText: {
    color: '#C9A24D',
    fontSize: 16,
    fontWeight: '600',
  },
  introBottomContainer: {
    position: 'absolute',
    bottom: 50,
    right: 24,
  },
  introHomeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 77, 0.5)',
  },
  introHomeButtonText: {
    color: '#C9A24D',
    fontSize: 16,
    fontWeight: '600',
  },
  introScrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C9A24D',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  introSection: {
    marginBottom: 20,
    paddingLeft: 8,
  },
  introSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  introSectionText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  skipIntroCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4b5563',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C9A24D',
    borderColor: '#C9A24D',
  },
  checkboxMark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipIntroText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  introButton: {
    backgroundColor: '#C9A24D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  introButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  settingsButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#C9A24D',
    textAlign: 'center',
  },
  dojoGateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  dojoGateImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dojoGateButtonContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dojoGateButton: {
    backgroundColor: 'rgba(201, 162, 77, 0.9)',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9A24D',
  },
  dojoGateButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  dojoGateTitle: {
    fontSize: 64,
    color: '#C9A24D',
    fontWeight: 'bold',
    letterSpacing: 16,
    marginBottom: 16,
  },
  dojoGateSubtitle: {
    fontSize: 16,
    color: '#C9A24D',
    opacity: 0.7,
    letterSpacing: 4,
  },
  startScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  startQuote: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  startSubtitle: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  // トーストスタイル
  toastContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Paywallスタイル
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  paywallCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  paywallPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 24,
  },
  paywallButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paywallRestoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallRestoreText: {
    color: '#888',
    fontSize: 14,
  },
  paywallCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // プラン選択スタイル
  planContainer: {
    width: '100%',
    marginBottom: 20,
  },
  planOption: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#2a2a4e',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  planBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  paywallLegal: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 14,
    paddingHorizontal: 8,
  },
  paywallLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paywallLinkText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'underline',
  },
  paywallLinkDivider: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  // Proボタンスタイル
  proButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  proButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#888',
    fontSize: 13,
  },
  // 無効ボタンスタイル
  startButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  startButtonTextDisabled: {
    color: '#555',
  },
  // 感謝スタイル
  gratitudeProgress: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginVertical: 16,
  },
  gratitudeInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  gratitudeCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    textAlign: 'center',
  },
  gratitudeCompleteBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  gratitudeCompleteText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  gratitudeListContainer: {
    marginTop: 16,
  },
  gratitudeItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gratitudeItemNumber: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
  },
  gratitudeItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
  },
  quizButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  quizButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proOnlyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // クイズスタイル
  quizOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quizCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  quizProgress: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 16,
  },
  quizQuestion: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  quizInput: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: 12,
  },
  quizHint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  quizSubmitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizSubmitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quizCorrect: {
    color: '#2DD4BF',
  },
  quizWrong: {
    color: '#ef4444',
  },
  quizNextButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizNextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // ホームボタン
  homeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  homeButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  // ヘッダーアイコン
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  // 道場タイトル
  dojoTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsIconButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 24,
  },
  // 集中機能スタイル
  focusQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
  },
  focusInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  focusPurposeBar: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  focusPurposeLabel: {
    color: '#D4AF37',
    fontSize: 14,
  },
  blockedSitesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  blockedSitesTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  blockedSiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  blockedSiteText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  removeSiteText: {
    color: '#ef4444',
    fontSize: 12,
  },
  addSiteRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  addSiteInput: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  addSiteButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSiteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  focusQBox: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  // 集中モード選択
  focusTypeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  focusTypeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  focusTypeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTypeButtonSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // 勉強タイマー画面
  studyTimerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  studyTimerLabel: {
    color: '#D4AF37',
    fontSize: 18,
    marginBottom: 16,
  },
  studyTimerDisplay: {
    color: '#FFF',
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  studyTimerControls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  studyControlButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  studyControlText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // タイマー設定
  timerSettingSection: {
    marginBottom: 16,
  },
  timerSettingLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timerButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  // ネットモードトップバー
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  focusTimerControl: {
    fontSize: 24,
  },
  // NGクイズ
  ngQuizTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ngQuizSub: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  ngQuizRemaining: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerBreak: {
    backgroundColor: '#2DD4BF',
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTimerControl: {
    fontSize: 24,
  },
  focusSessionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 8,
    paddingHorizontal: 12,
  },
  focusSessionsText: {
    color: '#D4AF37',
    fontSize: 12,
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  timerSettingSection: {
    marginBottom: 16,
  },
  timerSettingLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timerButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  focusHistorySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  focusHistoryTitle: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  focusHistoryItem: {
    color: '#9ca3af',
    fontSize: 13,
    paddingVertical: 6,
  },
  dojoIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  // 欲望可視化スタイル
  // 相談選択画面
  consultSelectBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  consultSelectContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingTop: 150,
  },
  consultTitleBox: {
    marginBottom: 40,
    alignItems: 'center',
  },
  consultTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
  },
  consultSubtitle: {
    color: '#666',
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 1,
  },
  consultSelectButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  consultSelectButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '500',
  },
  consultBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  consultBackButtonText: {
    color: '#C9A24D',
    fontSize: 14,
  },
  consultModeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  consultModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  consultModeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  consultModeText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  consultModeTextActive: {
    color: '#000',
  },
  yokubouBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  yokubouTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  yokubouSub: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 16,
  },
  yokubouImagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#262626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  yokubouImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  yokubouImagePlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  yokubouInput: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  yokubouSubmitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  yokubouSubmitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yokubouReplyBox: {
    backgroundColor: '#0d2818',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2DD4BF',
  },
  yokubouReplyLabel: {
    color: '#2DD4BF',
    fontSize: 12,
    marginBottom: 4,
  },
  yokubouReplyText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  yokubouSaveButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  yokubouSaveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yokubouSavedText: {
    color: '#2DD4BF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  yokubouResetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  yokubouResetText: {
    color: '#666',
    fontSize: 14,
  },
  yokubouButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  yokubouCameraButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  yokubouCameraButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yokubouGalleryButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  yokubouGalleryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // 1日1善スタイル
  goodDeedImageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  goodDeedCameraBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goodDeedCameraBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goodDeedGalleryBtn: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goodDeedGalleryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goodDeedImagePreviewContainer: {
    marginBottom: 12,
  },
  goodDeedImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  goodDeedInput: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  goodDeedTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  goodDeedTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
  },
  goodDeedTagChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  goodDeedTagText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  goodDeedTagTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  goodDeedListContainer: {
    marginTop: 16,
  },
  goodDeedListTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goodDeedItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  goodDeedItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  goodDeedItemContent: {
    flex: 1,
  },
  goodDeedItemText: {
    color: '#FFF',
    fontSize: 14,
  },
  goodDeedItemTag: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 4,
  },
  // 履歴画像スタイル
  historyImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  addToDiaryButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addToDiaryButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  goodDeedLogItem: {
    paddingVertical: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#D4AF37',
    marginBottom: 6,
  },
  goodDeedLogText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveReviewButton: {
    flex: 1,
    backgroundColor: '#2DD4BF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  saveReviewButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Apple風ボタンスタイル
  appleMainButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  appleMainButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appleEditButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  appleEditButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appleDeleteLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  appleDeleteLinkText: {
    color: '#FF3B30',
    fontSize: 15,
  },
  appleCancelLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  appleCancelLinkText: {
    color: '#007AFF',
    fontSize: 15,
  },
  // ミッションアラームスタイル
  missionAlarmContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
    justifyContent: 'center',
  },
  missionAlarmTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  missionAlarmSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  missionAlarmSection: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  missionAlarmSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  missionQuizTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  missionQuizQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 16,
  },
  missionQuizInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  missionAlarmButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  missionAlarmButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  missionAlarmSecondaryButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  missionAlarmSecondaryText: {
    color: '#FFF',
    fontSize: 16,
  },
  missionAmnestyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  missionAmnestyText: {
    color: '#888',
    fontSize: 14,
  },
  // ミッション提案スタイル
  missionProposalBox: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  missionProposalText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 26,
  },
  missionProposalHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  // 新オンボーディングスタイル
  newOnboardingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 60,
  },
  newOnboardingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  newOnboardingTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 36,
    textAlign: 'left',
  },
  newOnboardingSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 32,
    lineHeight: 22,
  },
  newOnboardingQuestion: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  newOnboardingButton: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    minHeight: 56,
  },
  newOnboardingButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  newOnboardingChoices: {
    gap: 16,
  },
  newOnboardingPrimaryChoice: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 80,
  },
  newOnboardingChoiceTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  newOnboardingChoiceSub: {
    color: '#666',
    fontSize: 13,
  },
  newOnboardingSecondaryChoice: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 80,
  },
  newOnboardingChoiceTitle2: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  newOnboardingChoiceSub2: {
    color: '#888',
    fontSize: 13,
  },
  // 相談からミッション作成ボタン
  createMissionButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 12,
    alignItems: 'center',
  },
  createMissionButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
});
