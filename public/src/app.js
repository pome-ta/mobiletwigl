//import {Fragmen} from './fragmen.js';

console.log('out: hoge01');

(() => {
let canvas     = null; // スクリーン
let editor     = null; // Ace editor のインスタンス
let lineout    = null; // ステータスバー DOM
let counter    = null; // 文字数カウンター DOM
let message    = null; // メッセージ DOM
let mode       = null; // variable mode select
let animate    = null; // アニメーション用 toggle
let frames     = null; // render frame select
let size       = null; // resolution select
let download   = null; // download button
let link       = null; // generate link button
let layer      = null; // dialog layer
let dialog     = null; // dialog message wrapper
let canvasWrap = null; // canvas を包んでいるラッパー DOM
let editorWrap = null; // editor を包んでいるラッパー DOM
let iconColumn = null; // icon を包んでいるラッパー DOM
let infoIcon   = null; // information icon
let fullIcon   = null; // fullscreen icon
let broadIcon  = null; // broadcast mode icon
let starIcon   = null; // star icon
let menuIcon   = null; // menu icon
let noteIcon   = null; // note icon
let hideIcon   = null; // hide menu icon
let syncToggle = null; // スクロール同期用のチェックボックス

let audioWrap     = null; // サウンドシェーダペインのラッパー
let audioEditor   = null; // Ace editor のインスタンス
let audioLineout  = null; // ステータスバー DOM
let audioCounter  = null; // 文字数カウンター DOM
let audioMessage  = null; // メッセージ DOM
let audioToggle   = null; // トグルボタン
let audioPlayIcon = null; // 再生ボタン
let audioStopIcon = null; // 停止ボタン

let latestStatus       = 'success';            // 直近のステータス
let latestAudioStatus  = 'success';            // 直近のステータス（サウンドシェーダ）
let isEncoding         = false;                // エンコード中かどうか
let currentMode        = Fragmen.MODE_CLASSIC; // 現在の Fragmen モード
let currentSource      = '';                   // 直近のソースコード
let currentAudioSource = '';                   // 直近の Sound Shader のソースコード
let fragmen            = null;                 // fragmen.js のインスタンス
let onomat             = null;                 // onomat.js のインスタンス
let musician           = null;                 // music.js のインスタンス

let urlParameter = null;  // GET パラメータを解析するための searchParams オブジェクト
let vimMode      = false; // vim mode
let syncScroll   = true;  // エディタ上で配信を受けている場合にスクロール同期するか

let fire = null;                  // firedb
let currentDirectorId = null;     // 自分自身のディレクター ID
let friendDirectorId = null;      // 招待用のディレクター ID
let currentChannelId = null;      // 自分自身がディレクターとなったチャンネルの ID
let currentDirectorName = null;   // ディレクターが指定した名前・グループ名
let broadcastForm = null;         // 登録用フォームの実体
let broadcastSetting = null;      // 登録用フォームの入力内容
let directionMode = null;         // 何に対するディレクターなのか
let friendDirectionMode = null;   // フレンドが何に対するディレクターなのか
let isOwner = null;               // チャンネルのオーナーなのかどうか
let isDirectorInitialized = true; // オーナー自身（及びフレンド）が復帰 URL を踏んだ際に初期化が完了しているかどうか
let shareURL = '';                // 配信用共有 URL
let ownerURL = '';                // ディレクターとして同環境に復帰できる URL
let friendURL = '';               // フレンド共有用 URL
let starCounterTimer = null;      // スターのアニメーション用タイマー
let viewerCounterTimer = null;    // 視聴者数のアニメーション用タイマー
let graphicsDisable = false;      // グラフィックス用のエディタを無効化するかどうか
let soundDisable = false;         // サウンド用のエディタを無効化するかどうか
let broadcastMode = 'none';       // 配信に対する挙動（none, owner, friend, audience）
let soundPlay = 0;                // サウンドが配信者の元で再生された際のカウント
let channelData = null;           // チャンネルのデータを保持
let starData = null;              // スターに関するデータを保持
let viewerData = null;            // 視聴者数に関するデータを保持
let editorFontSize = 17;          // エディタのフォントサイズ
console.log('in: hoge');

})();

console.log('out: hoge02');