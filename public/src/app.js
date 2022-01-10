import {Fragmen} from './fragmen.js';
import {Onomat} from './onomat.js';
import {Musician} from './music.js';


(() => {

console.log('start');
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

// fragmen.js 用のオプションの雛形
const FRAGMEN_OPTION = {
  target: null,
  eventTarget: null,
  mouse: true,
  resize: true,
  escape: false
}


window.addEventListener('DOMContentLoaded', () => {
  // DOM への参照
  canvas     = document.querySelector('#webgl');
  lineout    = document.querySelector('#lineout');
  counter    = document.querySelector('#counter');
  message    = document.querySelector('#message');
  mode       = document.querySelector('#modeselect');
  animate    = document.querySelector('#pausetoggle');
  frames     = document.querySelector('#frameselect');
  size       = document.querySelector('#sizeselect');
  download   = document.querySelector('#downloadgif');
  link       = document.querySelector('#permanentlink');
  layer      = document.querySelector('#layer');
  dialog     = document.querySelector('#dialogmessage');
  canvasWrap = document.querySelector('#canvaswrap');
  editorWrap = document.querySelector('#editorwrap');
  iconColumn = document.querySelector('#globaliconcolumn');
  infoIcon   = document.querySelector('#informationicon');
  fullIcon   = document.querySelector('#fullscreenicon');
  broadIcon  = document.querySelector('#broadcasticon');
  starIcon   = document.querySelector('#stariconwrap');
  menuIcon   = document.querySelector('#togglemenuicon');
  noteIcon   = document.querySelector('#noteicon');
  hideIcon   = document.querySelector('#hidemenuicon');
  syncToggle = document.querySelector('#syncscrolltoggle');

  audioWrap     = document.querySelector('#audio');
  audioLineout  = document.querySelector('#lineoutaudio');
  audioCounter  = document.querySelector('#counteraudio');
  audioMessage  = document.querySelector('#messageaudio');
  audioToggle   = document.querySelector('#audiotoggle');
  audioPlayIcon = document.querySelector('#playicon');
  audioStopIcon = document.querySelector('#stopicon');

  // fragmen からデフォルトのソース一覧を取得
  const fragmenDefaultSource = Fragmen.DEFAULT_SOURCE;

  // メニュー及びエディタを非表示にするかどうかのフラグ
  let isLayerHidden = false;

  // URL の GET パラメータの解析
  let myURL = new URL(window.location.href);
  urlParameter = myURL.searchParams;
  //urlParameter = getParameter();
  urlParameter.forEach((value, key) => {
    switch(key){
      case 'mode':
        currentMode = parseInt(value);
        break;
      case 'sound':
        audioToggle.checked = value === 'true';
        break;
      case 'source':
        currentSource = value;
        break;
      case 'soundsource':
        currentAudioSource = value;
        break;
      case 'gd': // graphics director
        currentDirectorId = value;
        break;
      case 'sd': // sound director
        currentDirectorId = value;
        break;
      case 'fd': // friend director
        friendDirectorId = value;
        break;
      case 'dm': // direction mode
        directionMode = value;
        let directionFlag = Object.entries(BROADCAST_DIRECTION).some(([key, val]) => {
          return val === value;
        });
        if(directionFlag !== true){
          directionMode = null;
        }
        break;
      case 'ch': // channel
        currentChannelId = value;
        break;
      case 'ow': // is owner
        isOwner = value === 'true';
        break;
      case 'ol': // overlay (hide menu view)
        document.querySelector('#wrap').classList.add('overlay');
        isLayerHidden = true;
        break;
    }
  });
  // URL パラメータより得たカレントモードが存在するか
  if(fragmenDefaultSource[currentMode] != null){
    mode.selectedIndex = currentMode;
  }else{
    currentMode = Fragmen.MODE_CLASSIC;
  }
  // この時点でカレントソースが空である場合既定のソースを利用する
  if(currentSource === ''){
    currentSource = fragmenDefaultSource[currentMode];
  }
  // audioToggle が checked ではないかサウンドシェーダのソースが空の場合既定のソースを利用する
  if(audioToggle.checked !== true || currentAudioSource === ''){
    currentAudioSource = Onomat.FRAGMENT_SHADER_SOURCE_DEFAULT;
  }

  // channel ID がある場合は配信に関係している状態とみなす
  
  let invalidURL = false;
  
  if(invalidURL === true){
    // 無効な URL とみなされるなにかがあったので通常の初期化フローにする
    currentDirectorId = null;
    friendDirectorId = null;
    currentChannelId = null;
    broadcastSetting = null;
    broadcastForm = null;
    directionMode = null;
    friendDirectionMode = null;
    isOwner = null;
    shareURL = '';
    ownerURL = '';
    friendURL = '';
    graphicsDisable = false;
    soundDisable = false;
    broadcastMode = 'none';
  }

  // Ace editor 関連の初期化
  let timeoutId = null;
  editor = editorSetting('editor', currentSource, (evt) => {
    // １秒以内の場合はタイマーをキャンセル
    if(timeoutId != null){clearTimeout(timeoutId);}
    timeoutId = setTimeout(() => {
      timeoutId = null;
      update(editor.getValue());
    }, 1000);
    // 文字数の出力
    counter.textContent = `${editor.getValue().length}`;
  }, (evt) => {
    // 配信中はステータスとは無関係に状態を送る
    if(currentChannelId != null && (broadcastMode === 'owner' || broadcastMode === 'friend')){
      // グラフィックスを編集する立場かどうか
      if(
        (broadcastMode === 'owner' && directionMode !== BROADCAST_DIRECTION.SOUND) ||
        (broadcastMode === 'friend' && directionMode === BROADCAST_DIRECTION.SOUND)
      ){
        updateGraphicsData(currentDirectorId, currentChannelId, currentMode);
      }
    }
  });
  let audioTimeoutId = null;
  audioEditor = editorSetting('editoraudio', currentAudioSource, (evt) => {
    // １秒以内の場合はタイマーをキャンセル
    if(audioTimeoutId != null){clearTimeout(audioTimeoutId);}
    audioTimeoutId = setTimeout(() => {
      audioTimeoutId = null;
      updateAudio(audioEditor.getValue());
    }, 1000);
    // 文字数の出力
    audioCounter.textContent = `${audioEditor.getValue().length}`;
  }, (evt) => {
    // 配信中はステータスとは無関係に状態を送る
    if(currentChannelId != null && (broadcastMode === 'owner' || broadcastMode === 'friend')){
      // グラフィックスを編集する立場かどうか
      if(
        (broadcastMode === 'owner' && directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
        (broadcastMode === 'friend' && directionMode === BROADCAST_DIRECTION.GRAPHICS)
      ){
        updateSoundData(currentDirectorId, currentChannelId, soundPlay);
      }
    }
  });
  
  
  // audioToggle が checked である場合、URL からサウンドシェーダが有効化されている
  
  if(audioToggle.checked === true){
    // todo: ユーザーアクションをしていないと（タップとか）音は出ない
    onomatSetting(true);
    update(editor.getValue());
    counter.textContent = `${editor.getValue().length}`;
    audioCounter.textContent = `${audioEditor.getValue().length}`;
  }

  // ウィンドウのリサイズ時
  window.addEventListener('resize', () => {
    resize();
  }, false);
  // 最初に一回リサイズ相当の処理を行っておく
  resize();

  // モード変更時の処理
  mode.addEventListener('change', () => {
    const defaultSourceInPrevMode = fragmenDefaultSource[currentMode];

    const source = editor.getValue();
    currentMode = parseInt(mode.value);
    fragmen.mode = currentMode;

    // 既定のソースと同じならモードに応じた既定のソースに書き換える
    if(source === defaultSourceInPrevMode){
      const defaultSource = fragmenDefaultSource[currentMode];
      editor.setValue(defaultSource);
      setTimeout(() => {editor.gotoLine(1);}, 100);
    }else{
      // ソースを置き換えないとしてもビルドはしなおす
      update(editor.getValue());
    }
  }, false);

  // アニメーション有効・無効設定用トグル
  animate.addEventListener('change', () => {
    if(animate.checked === true){
      // オンにされた場合はコンパイルを行う
      if(fragmen != null){
        fragmen.setAnimation(true);
        update(editor.getValue());
        fragmen.draw();
      }
    }else{
      // オフにされた場合はアニメーションさせない設定に切り替える
      if(fragmen != null){
        fragmen.setAnimation(false);
      }
    }
  }, false);



  // スクロール同期
  syncToggle.addEventListener('change', () => {
    syncScroll = syncToggle.checked;
  }, false);

  // メインとなる fragmen のインスタンス
  const option = Object.assign(FRAGMEN_OPTION, {
    target: canvas,
    eventTarget: window,
  });
  
  
  fragmen = new Fragmen(option);
  // シェーダが更新された段階で同時にメッセージを更新
  fragmen.onBuild((status, msg) => {
    latestStatus = status;
    lineout.classList.remove('warn');
    lineout.classList.remove('error');
    lineout.classList.add(status);
    message.textContent = msg;
    switch(status){
      case 'warn':
      case 'error':
        download.classList.add('disabled');
        link.classList.add('disabled');
        break;
      default:
        download.classList.remove('disabled');
        if(latestStatus === 'success' && latestAudioStatus === 'success'){
          link.classList.remove('disabled');
        }else{
          link.classList.add('disabled');
        }
    }
    // 配信中はステータスとは無関係に状態を送る
    if(currentChannelId != null && (broadcastMode === 'owner' || broadcastMode === 'friend')){
      // グラフィックスを編集する立場かどうか
      if(
        (broadcastMode === 'owner' && directionMode !== BROADCAST_DIRECTION.SOUND) ||
        (broadcastMode === 'friend' && directionMode === BROADCAST_DIRECTION.SOUND)
      ){
        updateGraphicsData(currentDirectorId, currentChannelId, currentMode);
      }
    }
  });
  
  
  fragmen.onDraw(() => {
    let freq = 0.0;
    if(musician != null && musician.isPlay === true){
      freq += musician.getFrequencyFloat();
    }
    if(onomat != null && audioToggle.checked === true && latestAudioStatus === 'success'){
      freq += onomat.getFrequencyFloat();
    }
    if(freq > 0.0){
      fragmen.setFrequency(freq);
    }
  });
  
  
  // デフォルトのメッセージを出力
  counter.textContent = `${currentSource.length}`;
  message.textContent = ' ● ready';
  // レンダリング開始
  fragmen.mode = currentMode;
  fragmen.render(currentSource);

  // WebGL 2.0 に対応しているかどうかによりドロップダウンリストの状態を変更
  if(fragmen.isWebGL2 !== true){
    for(let i = 0; i < mode.children.length; ++i){
      mode.children[i].disabled = Fragmen.MODE_WITH_ES_300.includes(i);
    }
  }
  

  // サウンドシェーダ関連
  audioToggle.addEventListener('change', () => {
    onomatSetting();
  }, false);
  audioPlayIcon.addEventListener('click', () => {
    if(audioToggle.checked !== true || latestAudioStatus !== 'success'){return;}
    ++soundPlay;
    updateAudio(audioEditor.getValue(), true);
    // 配信中はステータスとは無関係に状態を送る
    if(currentChannelId != null && (broadcastMode === 'owner' || broadcastMode === 'friend')){
      // グラフィックスを編集する立場かどうか
      if(
        (broadcastMode === 'owner' && directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
        (broadcastMode === 'friend' && directionMode === BROADCAST_DIRECTION.GRAPHICS)
      ){
        updateSoundData(currentDirectorId, currentChannelId, soundPlay);
      }
    }
  }, false);
  
  audioStopIcon.addEventListener('click', () => {
    if(musician != null){musician.stop();}
    if(audioToggle.checked !== true){return;}
    onomat.stop();
  }, false);
  
  
  window.addEventListener('keydown', (evt) => {
    // vim mode
    if(
      ((evt.ctrlKey === true || evt.metaKey === true) && evt.altKey === true) &&
      (evt.key === 'v' || evt.key === 'V' || evt.key === '√')
    ){
      vimMode = !vimMode;
      if(vimMode === true){
        editor.setKeyboardHandler('ace/keyboard/vim');
        audioEditor.setKeyboardHandler('ace/keyboard/vim');
      }else{
        editor.setKeyboardHandler(null);
        audioEditor.setKeyboardHandler(null);
      }
    }
    if((evt.ctrlKey === true || evt.metaKey === true) && evt.altKey === true && (evt.key === '†' || evt.key === 't')){
      toggleEditorView();
    }
    if((evt.ctrlKey === true || evt.metaKey === true) && evt.altKey === true && (evt.key === '≤' || evt.key === ',')){
      --editorFontSize;
      document.querySelector('#editor').style.fontSize = `${editorFontSize}px`;
      document.querySelector('#editoraudio').style.fontSize = `${editorFontSize}px`;
    }
    if((evt.ctrlKey === true || evt.metaKey === true) && evt.altKey === true && (evt.key === '≥' || evt.key === '.')){
      ++editorFontSize;
      document.querySelector('#editor').style.fontSize = `${editorFontSize}px`;
      document.querySelector('#editoraudio').style.fontSize = `${editorFontSize}px`;
    }
    if(evt.key === 'Enter' && evt.altKey === true){
      if(evt.ctrlKey === true){
        if(musician != null){musician.stop();}
      }
    }
    // onomat
    if(audioToggle.checked !== true || latestAudioStatus !== 'success'){return;}
    // Alt + Enter で再生、Ctrl をさらに付与すると停止
    if(evt.key === 'Enter' && evt.altKey === true){
      if(evt.ctrlKey === true){
        if(musician != null){musician.stop();}
        onomat.stop();
      }else{
        ++soundPlay;
        updateAudio(audioEditor.getValue(), true);
        // 配信中はステータスとは無関係に状態を送る
        if(currentChannelId != null && (broadcastMode === 'owner' || broadcastMode === 'friend')){
          // グラフィックスを編集する立場かどうか
          if(
            (broadcastMode === 'owner' && directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
            (broadcastMode === 'friend' && directionMode === BROADCAST_DIRECTION.GRAPHICS)
          ){
            updateSoundData(currentDirectorId, currentChannelId, soundPlay);
          }
        }
      }
    }
  }, false);
  
  // デフォルトのメッセージを出力
  audioCounter.textContent = `${Onomat.FRAGMENT_SHADER_SOURCE_DEFAULT.length}`;
  audioMessage.textContent = ' ● ready';

  // フルスクリーン解除時に DOM を元に戻すためのリスナー
  const onFullscreenChange = (evt) => {
    if(
      document.FullscreenElement == null &&
      document.webkitFullscreenElement == null &&
      document.msFullscreenElement == null
    ){
      // すべての要素が null だった場合、DOM 操作を行いエディタを表示させる
      exitFullscreenMode();
    }
  };
  // F11 ではなく、意図的なショートカットキー操作によってフルスクリーンへと移行するためのリスナー
  const onFullscreenKeyDown = (evt) => {
    if(evt.altKey === true && evt.ctrlKey === true && (evt.key.toLowerCase() === 'f' || evt.key === 'ƒ')){
      if(
        document.FullscreenElement != null ||
        document.webkitFullscreenElement != null ||
        document.msFullscreenElement != null
      ){
        // この場合、絶対に JavaScript から fullscreen 化しているので強制的に戻せばよい
        // ただし、イベントリスナーによって事後処理が自動的に行われることになるので
        // 発火するのは document.exitFullsScreen までで、DOM はここでは操作しない
        exitFullscreen();
      }else{
        // この場合、F11 で既に見た目上は fullscreen 化している可能性がある
        // F11 の fullscreen は requestFullscreen 等で fullscreen 化したものとは
        // 別物として扱われているが、いずれも Escape で解除できるため注意
        requestFullscreenMode();
      }
    }
  };
  
  
  // アイコンが押されたとき
  const onFullscreenRequest = () => {
    if(
      document.FullscreenElement == null ||
      document.webkitFullscreenElement == null ||
      document.msFullscreenElement == null
    ){
      requestFullscreenMode();
    }
  };
  // API がサポートされている場合に限りフルスクリーン関連のリスナーを登録する
  if(document.fullscreenEnabled === true){
    document.addEventListener('fullscreenchange', onFullscreenChange, false);
    window.addEventListener('keydown', onFullscreenKeyDown, false);
    fullIcon.addEventListener('click', onFullscreenRequest, false);
  }else if(document.webkitFullscreenEnabled === true){
    document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
    window.addEventListener('keydown', onFullscreenKeyDown, false);
    fullIcon.addEventListener('click', onFullscreenRequest, false);
  }else{
    // いずれでもない場合は API でフルスクリーン化することができないのでアイコンを消す
    fullIcon.classList.add('nevershow');
  }

  // information アイコンが押されたとき
  infoIcon.addEventListener('click', () => {
    const wrap = document.createElement('div');

    const infoHeader = document.createElement('h3');
    infoHeader.textContent = 'Information';
    const infoCaption = document.createElement('div');
    infoCaption.textContent = 'twigl.app is an online editor for One tweet shader, with GIF generator, sound shader, and broadcast live coding.';
    wrap.appendChild(infoHeader);
    wrap.appendChild(infoCaption);

    const modeHeader = document.createElement('h3');
    modeHeader.textContent = 'Edit mode';
    const modeCaption = document.createElement('div');
    const modeMessage = [
      'There are four modes in twigl.app, each of which has a sub-mode that uses GLSL ES 3.0, or in addition to it, a mode that enables MRT.',
      'classic:',
      'This mode is compatible with GLSLSandbox.',
      'The uniform variables are "resolution", "mouse", "time", "frame", and "backbuffer".',
      'geek:',
      'In this mode, the various uniform variables are in a single-character style.',
      '"r", "m", "t", "f", and "b", respectively.',
      'geeker:',
      'In this mode, there is no need to declare precision and uniform. They are automatically complemented on the implementation side. Otherwise, it is the same as in geek mode.',
      'geekest:',
      'In this mode, the description of "void main(){}" can be omitted, and "gl_FragCoord" can be described as "FC". In addition, a variety of GLSL snippets are available.',
      'For more information, please see below.',
    ];
    modeMessage.forEach((v) => {
      const e = document.createElement('div');
      e.textContent = v;
      modeCaption.appendChild(e);
    });
    const modeInfoAnchorWrap = document.createElement('div');
    const modeInfoAnchor = document.createElement('a');
    modeInfoAnchor.setAttribute('href', 'https://github.com/doxas/twigl');
    modeInfoAnchor.setAttribute('target', '_blank');
    modeInfoAnchor.textContent = 'doxas/twigl - GitHub';
    modeInfoAnchorWrap.appendChild(modeInfoAnchor);
    modeCaption.appendChild(modeInfoAnchorWrap);
    wrap.appendChild(modeHeader);
    wrap.appendChild(modeCaption);

    const soundHeader = document.createElement('h3');
    soundHeader.textContent = 'Sound Shader';
    const soundCaption = document.createElement('div');
    const soundMessage = [
      'Sound Shader is compatible with the great pioneer, Shadertoy.',
      'Also, the output from the "mainSound" function can be referred to as a uniform variable with the name "sound" or "s" in various graphics modes.',
    ];
    soundMessage.forEach((v) => {
      const e = document.createElement('div');
      e.textContent = v;
      soundCaption.appendChild(e);
    });
    wrap.appendChild(soundHeader);
    wrap.appendChild(soundCaption);

    const authorHeader = document.createElement('h3');
    authorHeader.textContent = 'Author';
    const authorCaption = document.createElement('div');
    const authorAnchor = document.createElement('a');
    authorAnchor.textContent = 'doxas';
    authorAnchor.setAttribute('href', 'https://twitter.com/h_doxas');
    authorAnchor.setAttribute('target', '_blank');
    authorCaption.appendChild(authorAnchor);
    wrap.appendChild(authorHeader);
    wrap.appendChild(authorCaption);

    const sourceHeader = document.createElement('h3');
    sourceHeader.textContent = 'Source Code';
    const sourceCaption = document.createElement('div');
    const sourceAnchor = document.createElement('a');
    sourceAnchor.textContent = 'doxas/twigl';
    sourceAnchor.setAttribute('href', 'https://github.com/doxas/twigl');
    sourceAnchor.setAttribute('target', '_blank');
    sourceCaption.appendChild(sourceAnchor);
    wrap.appendChild(sourceHeader);
    wrap.appendChild(sourceCaption);

    showDialog(wrap, {
      okVisible: true,
      cancelVisible: false,
      okLabel: 'close',
    });
  }, false);

  // star
  starIcon.addEventListener('click', () => {
    if(currentChannelId == null){return;}
    fire.updateStarData(currentChannelId);
  }, false);

  // hide menu
  hideIcon.addEventListener('click', () => {
    toggleLayerView();
  }, false);

  // toggle menu
  menuIcon.addEventListener('click', () => {
    toggleEditorView();
  }, false);

  
  // URL から取得した情報に応じて配信かどうか判断しセットアップする
  if(broadcastMode !== 'none'){
    channelData = null;
    starData = null;
    viewerData = null;
    soundPlay = 0;
    fire.getChannelData(currentChannelId)
      .then((snapshot) => {
        channelData = snapshot;
        soundPlay = channelData.sound.play;
        return fire.getViewerData(currentChannelId);
      })
      .then((snapshot) => {
        viewerData = snapshot;
        return fire.getStarData(currentChannelId);
      })
      .then((snapshot) => {
        let icon = null;
        starData = snapshot;
        // いずれにしても共通する復元処理
        fragmen.mode = currentMode = channelData.graphics.mode;          // モードの復元と設定
        mode.selectedIndex = currentMode;                                // ドロップダウンリストのモードの復元
        editor.setValue(channelData.graphics.source);                    // エディタ上にソースを復元
        update(channelData.graphics.source);                             // 復元したソースで更新
        counter.textContent = `${channelData.graphics.source.length}`;   // 文字数カウント
        audioEditor.setValue(channelData.sound.source);                  // サウンドシェーダのソースを復元
        audioCounter.textContent = `${channelData.sound.source.length}`; // 文字数カウント
        setTimeout(() => {editor.gotoLine(1);}, 100);
        setTimeout(() => {audioEditor.gotoLine(1);}, 100);
        editor.setReadOnly(graphicsDisable);              // エディタの読み取り専用属性を設定
        audioEditor.setReadOnly(soundDisable);            // エディタの読み取り専用属性を設定
        updateStar(starData.count);                       // スターの内容を更新
        updateViewer(viewerData.count);                   // 視聴者数の内容を更新
        showStarIcon();                                   // スターを表示
        showViewerIcon();                                 // 視聴者数を表示
        fire.listenStarData(currentChannelId, (snap) => { // リスナーを設定
          starData = snap;
          updateStar(starData.count);
        });
        fire.listenViewerData(currentChannelId, (snap) => { // リスナーを設定
          viewerData = snap;
          updateViewer(viewerData.count);
        });
        // 各配信モードごとの処理
        switch(broadcastMode){
          case 'owner':
            // オーナーとしての復帰を完了したとみなしてフラグを立てなおす
            isDirectorInitialized = true;
            // 自分で立てた配信
            if(directionMode === BROADCAST_DIRECTION.BOTH || directionMode === BROADCAST_DIRECTION.SOUND){
              // サウンドが必要な場合自家製ダイアログを出しクリック操作をさせる
              showDialog('Sound playback is enabled on this channel.', {cancelVisible: false})
                .then(() => {
                  // onomat を初期化
                  audioToggle.checked = true;
                  onomatSetting(false);
                });
            }
            if(directionMode === BROADCAST_DIRECTION.SOUND && friendDirectorId != null){
              // 一部配信を受けることになるのでスクロール同期スイッチを表示
              showSyncScrollSwitch();
              hideAuthorBlock();
              // グラフィックスを listen
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectGraphics(channelData);
              });
            }else if(directionMode === BROADCAST_DIRECTION.GRAPHICS && friendDirectorId != null){
              // 一部配信を受けることになるのでスクロール同期スイッチを表示
              showSyncScrollSwitch();
              hideAuthorBlock();
              // サウンドを listen
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectSound(channelData);
                if(soundPlay !== channelData.sound.play){
                  soundPlay = channelData.sound.play;
                  // リモートの再生回数が変更になっていたら再生する
                  if(latestAudioStatus !== 'success'){return;}
                  updateAudio(audioEditor.getValue(), true);
                }
              });
            }
            break;
          case 'friend':
            // 配信を受けることになるのでスクロール同期スイッチを表示
            showSyncScrollSwitch();
            hideAuthorBlock();
            // フレンドとしての復帰を完了したとみなしてフラグを立てなおす
            isDirectorInitialized = true;
            // フレンドありに設定されている時点でサウンドは鳴る可能性がある
            showDialog('Sound playback is enabled on this channel.', {cancelVisible: false})
              .then(() => {
                // onomat を初期化
                audioToggle.checked = true;
                onomatSetting(false);
              });
            if(directionMode === BROADCAST_DIRECTION.SOUND){
              // サウンドを listen
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectSound(channelData);
                if(soundPlay !== channelData.sound.play){
                  soundPlay = channelData.sound.play;
                  // リモートの再生回数が変更になっていたら再生する
                  if(latestAudioStatus !== 'success'){return;}
                  updateAudio(audioEditor.getValue(), true);
                }
              });
            }else if(directionMode === BROADCAST_DIRECTION.GRAPHICS){
              // グラフィックスを listen
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectGraphics(channelData);
              });
            }
            // フレンド側には配信アイコンを表示しない
            icon = document.querySelector('#broadcasticon');
            icon.classList.add('nevershow');
            break;
          case 'audience':
            if(channelData.disc !== 'unknown'){
              // 視聴ユーザーがサウンドの再生を許可したかどうか
              let soundEnable = false;
              // disc が unknown ではない場合、サウンドが更新される可能性がある
              showDialog('This channel is a valid of sound shader.\nIt is OK play the audio?', {
                okLabel: 'yes',
                cancelLabel: 'no',
              })
                .then((result) => {
                  soundEnable = result;
                  // ユーザーが OK, Cancel のいずれをクリックしたかのフラグを引数に与える
                  audioToggle.checked = true;
                  onomatSetting(result);
                  audioCounter.textContent = `${audioEditor.getValue().length}`;
                });
              // リスナーを設定
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectGraphics(channelData);
                reflectSound(channelData);
                if(soundEnable === true && soundPlay !== channelData.sound.play){
                  soundPlay = channelData.sound.play;
                  // ユーザーが許可している & リモートの再生回数が変更になっていたら再生する
                  if(audioToggle.checked !== true || latestAudioStatus !== 'success'){return;}
                  updateAudio(audioEditor.getValue(), true);
                }
              });
            }else{
              // サウンド以外のリスナーを設定
              fire.listenChannelData(currentChannelId, (snap) => {
                channelData = snap;
                reflectGraphics(channelData);
              });
              // サウンドシェーダの配信が無いので仮に出ていてもエディタ領域は隠す
              audioToggle.checked = false;
              audioWrap.classList.add('invisible');
              audioPlayIcon.classList.add('disabled');
              audioStopIcon.classList.add('disabled');
            }
            // 視聴者側には配信アイコンを表示しない
            icon = document.querySelector('#broadcasticon');
            icon.classList.add('nevershow');
            // 視聴者側ではメニューの状態を変更する
            fire.getDirectorData(channelData.directorId)
              .then((snap) => {
                hideMenu(snap.name);
              });
            // 視聴者数をカウントアップする
            fire.updateViewerData(currentChannelId);
            // 同時に離脱時の設定を行う
            window.addEventListener('beforeunload', (evt) => {
              evt.preventDefault();
              evt.returnValue = '';
              fire.updateViewerData(currentChannelId, false);
              // ユーザーがどちらの選択肢を取ったのかを知る方法が無いので……
              // とりあえず１分後にもこのウィンドウのインスタンスが開いているなら
              // 視聴を継続しているとみなしてカウントアップする
              setTimeout(() => {
                fire.updateViewerData(currentChannelId);
              }, 60000);
            }, false);
            // 配信を受けることになるのでスクロール同期スイッチを表示
            // ※ Author ブロックを非表示にしなくても余白があるので非表示化しない
            showSyncScrollSwitch();
            break;
        }

      })
      .catch((err) => {
        console.error('💣', err);
        showDialog('Firebase Error', {cancelVisible: false});
      });
  }

  // メニュー及びエディタが非表示の場合（フルスクリーンとは異なる点に注意）
  if(isLayerHidden === true){toggleLayerView();}

console.log('end');
// todo: エディタを`canvas` の上にもってくる
toggleEditorView();
}, false);

/*

/**
 * ウィンドウリサイズ時の処理
 */
function resize(){
  const canvas = document.querySelector('#webgl');
  const bound = canvas.parentElement.getBoundingClientRect();
  canvas.width = bound.width;
  canvas.height = bound.height;
}

/**
 * レイヤービューの変更
 */
function toggleLayerView(){
  canvasWrap.classList.toggle('fullheight');
  editorWrap.classList.toggle('invisible');
  fullIcon.classList.toggle('invisible');
  broadIcon.classList.toggle('invisible');
  hideIcon.classList.toggle('hide');
  menuIcon.classList.toggle('invisible');
  noteIcon.classList.toggle('invisible');
  editor.resize();
  audioEditor.resize();
  resize();
  fragmen.rect();

  if(hideIcon.classList.contains('hide') === true){
    hideIcon.title = 'hide editor';
  }else{
    hideIcon.title = 'show editor';
  }
}

/**
 * エディタビューの変更
 */
function toggleEditorView(){
  const wrap = document.querySelector('#wrap');
  wrap.classList.toggle('overlay');
  editor.resize();
  audioEditor.resize();
  resize();
  fragmen.rect();
}

/**
 * ローカルのオーディオファイルを読み込み及び再生
 */
function execMusician(){
  if(musician == null){
    musician = new Musician();
  }
  musician.loadFile()
    .then(() => {
      musician.play();
    });
}

/**
 * シェーダのソースを更新
 */
function update(source){
  if(fragmen == null){return;}
  fragmen.render(source);
}

/**
 * シェーダのソースを更新
 */
function updateAudio(source, force){
  if(onomat == null){return;}
  onomat.render(source, force);
}

/**
 * 更新を受けてグラフィックス側の状態を反映させる
 * @param {object} data - 更新データ
 */
function reflectGraphics(data){
  fragmen.mode = currentMode = mode.selectedIndex = data.graphics.mode;
  const numbers = data.graphics.cursor.split('|');
  if(editor.getValue() !== data.graphics.source){
    editor.setValue(data.graphics.source);
  }
  if(syncScroll === true){
    editor.gotoLine(parseInt(numbers[0]) + 1, parseInt(numbers[1]), true);
    editor.session.setScrollTop(parseInt(numbers[2]));
  }else{
    editor.clearSelection();
  }
}

/**
 * 更新を受けてサウンド側の状態を反映させる
 * @param {object} data - 更新データ
 */
function reflectSound(data){
  const numbers = data.sound.cursor.split('|');
  if(audioEditor.getValue() !== data.sound.source){
    audioEditor.setValue(data.sound.source);
  }
  if(syncScroll === true){
    audioEditor.gotoLine(parseInt(numbers[0]) + 1, parseInt(numbers[1]), true);
    audioEditor.session.setScrollTop(parseInt(numbers[2]));
  }else{
    audioEditor.clearSelection();
  }
}

/**
 * Ace editor の初期設定
 * @param {string} id - 対象となる DOM が持つ ID 属性
 * @param {string} source - 初期値として設定するソースコード
 * @param {function} onChange - change イベント用コールバック
 * @param {function} onSelectionChange - selection change イベント用コールバック
 * @param {string} [theme='chaos'] - テーマ
 */
function editorSetting(id, source, onChange, onSelectionChange, theme = 'chaos'){
  const edit = ace.edit(id);
  edit.setTheme(`ace/theme/${theme}`);
  edit.session.setOption('indentedSoftWrap', false);
  edit.session.setUseWrapMode(true);
  edit.session.setMode('ace/mode/glsl');
  edit.session.setTabSize(2);
  edit.session.setUseSoftTabs(true);
  edit.$blockScrolling = Infinity;
  edit.setShowPrintMargin(false);
  edit.setShowInvisibles(true);
  edit.setHighlightSelectedWord(true);
  edit.setValue(source);

  // editor の内容が変化した際のリスナーを設定
  edit.session.on('change', onChange);

  // editor 内で選択が変更した際のリスナーを設定
  edit.selection.on('changeSelection', onSelectionChange);

  // １行目にフォーカスしておく
  setTimeout(() => {edit.gotoLine(1);}, 100);
  return edit;
}

/**
 * GIF をキャプチャする
 * @param {number} [frame=180] - キャプチャするフレーム数
 * @param {number} [width=512] - キャプチャする際の canvas の幅
 * @param {number} [height=256] - キャプチャする際の canvas の高さ
 * @param {string} [format='gif'] - capture output format
 * @param {number} [framerate=60] - capture framerate
 * @param {number} [quality=100] - capture quality
 * @param {number} [offset=0.0] - offset base time
 */
function captureAnimation(frame = 180, width = 512, height = 256, format = 'gif', framerate = 60, quality = 100, offset = 0.0){
  // CCapture の初期化
  const ccapture = new CCapture({
    verbose: false,
    format: format,
    workersPath: './js/',
    framerate: framerate,
    quality: quality,
    onProgress: (range) => {
      // 変換進捗の出力
      const p = Math.floor(range * 100);
      download.textContent = `${p}%`;
    },
  });

  // キャプチャ用の canvas の生成と設定
  let captureCanvas = document.createElement('canvas');
  // document 上に存在しないと WebGL 側で初期化に失敗する
  captureCanvas.width          = width;
  captureCanvas.height         = height;
  captureCanvas.style.position = 'absolute';
  captureCanvas.style.top      = '-9999px';
  captureCanvas.style.left     = '-9999px';
  document.body.appendChild(captureCanvas);
  const option = Object.assign(FRAGMEN_OPTION, {
    target: captureCanvas,
    eventTarget: captureCanvas,
    offsetTime: offset,
  });
  // モードを揃えて新しい fragmen のインスタンスを生成
  let frag = new Fragmen(option);
  frag.mode = currentMode;
  // 引数の指定フレーム数分レンダリングし GIF を生成
  let frameCount = 0;
  frag.onDraw(() => {
    if(frameCount < frame){
      ccapture.capture(captureCanvas);
    }else{
      frag.run = false;
      ccapture.stop();
      ccapture.save((blob) => {
        setTimeout(() => {
          // blob からダウンロードリンクを生成する
          const url = URL.createObjectURL(blob);
          let anchor = document.createElement('a');
          document.body.appendChild(anchor);
          anchor.download = `${uuid()}.${format}`;
          anchor.href = url;
          anchor.click();
          document.body.removeChild(anchor);
          document.body.removeChild(captureCanvas);
          // 後始末をして UI を復帰させる
          URL.revokeObjectURL(url);
          download.classList.remove('disabled');
          download.textContent = 'Download';
          isEncoding = false;
          captureCanvas = null;
          frag = null;
          anchor = null;
        }, 500);
      });
    }
    ++frameCount;
  });
  ccapture.start();
  frag.render(editor.getValue());
}

/**
 * 時間を指定して静止画をキャプチャする
 * @param {number} [time=0] - capture time
 * @param {number} [width=512] - キャプチャする際の canvas の幅
 * @param {number} [height=256] - キャプチャする際の canvas の高さ
 * @param {string} [format='jpg'] - capture output format
 */
function captureImage(time = 0, width = 512, height = 256, format = 'jpg'){
  // キャプチャ用の canvas の生成と設定
  let captureCanvas = document.createElement('canvas');
  // document 上に存在しないと WebGL 側で初期化に失敗する
  captureCanvas.width          = width;
  captureCanvas.height         = height;
  captureCanvas.style.position = 'absolute';
  captureCanvas.style.top      = '-9999px';
  captureCanvas.style.left     = '-9999px';
  document.body.appendChild(captureCanvas);
  const option = Object.assign(FRAGMEN_OPTION, {
    target: captureCanvas,
    eventTarget: captureCanvas,
  });
  // モードを揃えて新しい fragmen のインスタンスを生成
  let frag = new Fragmen(option);
  frag.mode = currentMode;
  frag.onDraw(() => {
    frag.run = false;
    // blob からダウンロードリンクを生成する
    const formatName = format === 'jpg' ? 'jpeg' : format;
    const url = captureCanvas.toDataURL(`image/${formatName}`);
    let anchor = document.createElement('a');
    document.body.appendChild(anchor);
    anchor.download = `${uuid()}.${format}`;
    anchor.href = url;
    anchor.click();
    document.body.removeChild(anchor);
    document.body.removeChild(captureCanvas);
    // 後始末をして UI を復帰させる
    download.classList.remove('disabled');
    download.textContent = 'Download';
    isEncoding = false;
    captureCanvas = null;
    frag = null;
    anchor = null;
  });
  frag.render(editor.getValue(), time);
}

/**
 * audioToggle の状態によりエディタの表示・非表示を切り替え、場合により Onomat の初期化を行う
 * @param {boolean} [play=true] - そのまま再生まで行うかどうかのフラグ
 */
function onomatSetting(play = true){
  // onomat のインスタンスが既に存在するかどうか
  if(onomat == null){
    // 存在しない場合生成を試みる
    onomat = new Onomat();
    // ビルド時のイベントを登録
    onomat.on('build', (res) => {
      latestAudioStatus = res.status;
      audioLineout.classList.remove('warn');
      audioLineout.classList.remove('error');
      audioLineout.classList.add(res.status);
      audioMessage.textContent = res.message;
      if(latestStatus === 'success' && latestAudioStatus === 'success'){
        link.classList.remove('disabled');
      }else{
        link.classList.add('disabled');
      }
    });
    // 再生まで行うよう引数で指定されている場合は再生処理をタイマーで登録
    if(play === true){
      setTimeout(() => {
        updateAudio(audioEditor.getValue(), true);
      }, 500);
    }
  }
  // 表示・非表示の切り替え
  if(audioToggle.checked === true){
    audioWrap.classList.remove('invisible');
    audioPlayIcon.classList.remove('disabled');
    audioStopIcon.classList.remove('disabled');
  }else{
    audioWrap.classList.add('invisible');
    audioPlayIcon.classList.add('disabled');
    audioStopIcon.classList.add('disabled');
  }
  // エディタのスクロールがおかしくならないようにリサイズ処理を呼んでおく
  editor.resize();
  audioEditor.resize();
}

/**
 * 配信用フォームの部品を生成する
 * @return {HTMLDivElement}
 */
function generateBroadcastForm(){
  const wrap = document.createElement('div');

  const directorNameHeader = document.createElement('h3');
  directorNameHeader.textContent = 'screen name';
  const directorNameInput = document.createElement('input');
  directorNameInput.classList.add('directorname'); // screen name
  directorNameInput.setAttribute('type', 'text');
  directorNameInput.setAttribute('placeholder', 'your screen name or group name');
  wrap.appendChild(directorNameHeader);
  wrap.appendChild(directorNameInput);

  const assignHeader = document.createElement('h3');
  assignHeader.textContent = 'assign setting';
  const assignCaption = document.createElement('div');
  assignCaption.textContent = 'How do you assign them?';
  wrap.appendChild(assignHeader);
  wrap.appendChild(assignCaption);

  const assignLabelBoth = document.createElement('label');
  const assignCaptionBoth = document.createElement('span');
  assignCaptionBoth.textContent = 'both (graphics, sound)';
  const assignInputBoth = document.createElement('input');
  assignInputBoth.classList.add('assignboth'); // both
  assignInputBoth.setAttribute('type', 'radio');
  assignInputBoth.setAttribute('name', 'assignment');
  assignInputBoth.checked = true;
  wrap.appendChild(assignLabelBoth);
  assignLabelBoth.appendChild(assignInputBoth);
  assignLabelBoth.appendChild(assignCaptionBoth);

  const assignLabelGraphicsOnly = document.createElement('label');
  const assignCaptionGraphicsOnly = document.createElement('span');
  assignCaptionGraphicsOnly.textContent = 'only graphics';
  const assignInputGraphicsOnly = document.createElement('input');
  assignInputGraphicsOnly.classList.add('assignonlygraphics'); // only graphics
  assignInputGraphicsOnly.setAttribute('type', 'radio');
  assignInputGraphicsOnly.setAttribute('name', 'assignment');
  wrap.appendChild(assignLabelGraphicsOnly);
  assignLabelGraphicsOnly.appendChild(assignInputGraphicsOnly);
  assignLabelGraphicsOnly.appendChild(assignCaptionGraphicsOnly);

  const assignLabelSoundToFriend = document.createElement('label');
  const assignCaptionSoundToFriend = document.createElement('span');
  assignCaptionSoundToFriend.textContent = 'graphics, and invite friend to sound';
  const assignInputSoundToFriend = document.createElement('input');
  assignInputSoundToFriend.classList.add('assigninvitesound'); // sound to friend
  assignInputSoundToFriend.setAttribute('type', 'radio');
  assignInputSoundToFriend.setAttribute('name', 'assignment');
  wrap.appendChild(assignLabelSoundToFriend);
  assignLabelSoundToFriend.appendChild(assignInputSoundToFriend);
  assignLabelSoundToFriend.appendChild(assignCaptionSoundToFriend);

  const assignLabelSoundOnly = document.createElement('label');
  const assignCaptionSoundOnly = document.createElement('span');
  assignCaptionSoundOnly.textContent = 'only sound';
  const assignInputSoundOnly = document.createElement('input');
  assignInputSoundOnly.classList.add('assignonlysound'); // only sound
  assignInputSoundOnly.setAttribute('type', 'radio');
  assignInputSoundOnly.setAttribute('name', 'assignment');
  wrap.appendChild(assignLabelSoundOnly);
  assignLabelSoundOnly.appendChild(assignInputSoundOnly);
  assignLabelSoundOnly.appendChild(assignCaptionSoundOnly);

  const assignLabelGraphicsToFriend = document.createElement('label');
  const assignCaptionGraphicsToFriend = document.createElement('span');
  assignCaptionGraphicsToFriend.textContent = 'sound, and invite friend to graphics';
  const assignInputGraphicsToFriend = document.createElement('input');
  assignInputGraphicsToFriend.classList.add('assigninvitegraphics'); // graphics to friend
  assignInputGraphicsToFriend.setAttribute('type', 'radio');
  assignInputGraphicsToFriend.setAttribute('name', 'assignment');
  wrap.appendChild(assignLabelGraphicsToFriend);
  assignLabelGraphicsToFriend.appendChild(assignInputGraphicsToFriend);
  assignLabelGraphicsToFriend.appendChild(assignCaptionGraphicsToFriend);

  return wrap;
}

/**
 * 配信用フォームの部品を生成する
 * @return {HTMLDivElement}
 */
function generateShareAnchor(ownerURL, friendURL, shareURL){
  const wrap = document.createElement('div');
  const directorHeader = document.createElement('h3');
  directorHeader.textContent = 'Director (You)';
  const directorCaption = document.createElement('div');
  directorCaption.textContent = 'The URL to return to a state where you can edit this channel again.';
  const directorAnchor = document.createElement('a');
  directorAnchor.textContent = 'Director URL';
  directorAnchor.setAttribute('href', ownerURL);
  wrap.appendChild(directorHeader);
  wrap.appendChild(directorCaption);
  wrap.appendChild(directorAnchor);
  if(friendURL != null && friendURL !== ''){
    const friendHeader = document.createElement('h3');
    friendHeader.textContent = 'Co-Editor (Friend)';
    const friendCaption = document.createElement('div');
    friendCaption.textContent = 'Only share it with friends who are co-editors.';
    const friendAnchor = document.createElement('a');
    friendAnchor.textContent = 'Friend URL';
    friendAnchor.setAttribute('href', friendURL);
    wrap.appendChild(friendHeader);
    wrap.appendChild(friendCaption);
    wrap.appendChild(friendAnchor);
  }
  const publicHeader = document.createElement('h3');
  publicHeader.textContent = 'Audience';
  const publicCaption = document.createElement('div');
  publicCaption.textContent = 'This is a URL for public broadcast.';
  const publicAnchor = document.createElement('a');
  publicAnchor.textContent = 'Broadcast URL';
  publicAnchor.setAttribute('href', shareURL);
  wrap.appendChild(publicHeader);
  wrap.appendChild(publicCaption);
  wrap.appendChild(publicAnchor);

  return wrap;
}

/**
 * searchParams を取得する
 * @return {URLSearchParams}
 */
function getParameter(){
  return new URL(document.location).searchParams;
}

/**
 * 現在の状態を再現するための URL パラメータを生成し短縮 URL を取得する
 * @return {Promise} - 短縮 URL を取得すると解決する Promise
 */
function generatePermamentLink(){
  return new Promise((resolve, reject) => {
    let result = [];
    if(latestStatus === 'success'){
      result.push(`ol=true`);
      result.push(`mode=${mode.value}`);
      result.push(`source=${encodeURIComponent(editor.getValue())}`);
      if(audioToggle.checked === true){
        if(latestAudioStatus === 'success'){
          result.push(`sound=true`);
          result.push(`soundsource=${encodeURIComponent(audioEditor.getValue())}`);
        }
      }
    }
    // 何らかのパラメータが付与された場合 URL に結合する
    if(result.length > 0){
      const param = result.join('&');
      const url = `${BASE_URL}?${param}`;
      generateUrl(url)
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          resolve({
            url: url,
            json: json,
          });
        });
    }else{
      reject();
    }
  });
}

/**
 * パラメータの付与された「もととなる URL」から短縮 URL の取得を試みる
 * @param {string} - もととなる URL
 * @return {Promise}
 */
function generateUrl(url){
  const endpoint = 'https://api-ssl.bitly.com/v4/shorten';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${__BITLY_ACCESS_TOKEN__}`
  };
  return fetch(endpoint, {
    method: 'post',
    headers, headers,
    body: JSON.stringify({long_url: url}),
  });
}

/**
 * オーナーディレクター自身が復帰できる完全なディレクター URL を生成する
 * @param {number} graphicsMode - 現在のグラフィックスのモード
 * @param {string} directionMode - BROADCAST_DIRECTION に含まれるディレクションモード
 * @param {string} assign - BROADCAST_ASSIGN に含まれるアサインの設定
 * @param {string} directorId - ディレクター ID
 * @param {string} channelId - チャンネル ID
 * @param {string} friendId - フレンドに設定するディレクター ID
 * @return {string}
 */
function generateDirectorURL(graphicsMode, directionMode, assign, directorId, channelId, friendId){
  const currentState = [
    `mode=${graphicsMode}`,
    `dm=${directionMode}`,
    `ch=${channelId}`,
    `ow=true`,
  ];
  switch(assign){
    case BROADCAST_ASSIGN.BOTH:
    case BROADCAST_ASSIGN.ONLY_GRAPHICS:
      currentState.push(`gd=${directorId}`);
      break;
    case BROADCAST_ASSIGN.INVITE_SOUND:
      currentState.push(`gd=${directorId}`, `fd=${friendId}`);
      break;
    case BROADCAST_ASSIGN.ONLY_SOUND:
      currentState.push(`sd=${directorId}`);
      break;
    case BROADCAST_ASSIGN.INVITE_GRAPHICS:
      currentState.push(`sd=${directorId}`, `fd=${friendId}`);
      break;
  }
  return currentState.join('&');
}


function generateFriendURL(graphicsMode, directionMode, assign, directorId, channelId, friendId){
  const currentState = [
    `mode=${graphicsMode}`,
    `dm=${directionMode}`,
    `ch=${channelId}`,
    `ow=false`,
  ];
  // フレンド側での fd パラメータがチャンネルのオーナーディレクターとなる
  switch(assign){
    case BROADCAST_ASSIGN.INVITE_SOUND:
      currentState.push(`sd=${friendId}`, `fd=${directorId}`);
      break;
    case BROADCAST_ASSIGN.INVITE_GRAPHICS:
      currentState.push(`gd=${friendId}`, `fd=${directorId}`);
      break;
    default:
      return '';
  }
  return currentState.join('&');
}

/**
 * グラフィックスデータを送信するための一連の処理をまとめたもの
 * @param {string} directorId - ディレクター ID
 * @param {string} channelId - チャンネル ID
 * @param {number} mode - 現在のモード
 */
function updateGraphicsData(directorId, channelId, mode){
  // ディレクターとしての初期化が完了していない場合リモートに送信しない
  if(isDirectorInitialized !== true){return;}
  // カーソル位置やスクロール位置
  const cursor = editor.selection.getCursor();
  const scrollTop = editor.session.getScrollTop();
  const graphicsData = {
    cursor: `${cursor.row}|${cursor.column}|${scrollTop}`,
    source: editor.getValue(),
    mode: mode,
  };
  fire.updateChannelData(directorId, channelId, graphicsData);
}

/**
 * サウンドデータを送信するための一連の処理をまとめたもの
 * @param {string} directorId - ディレクター ID
 * @param {string} channelId - チャンネル ID
 * @param {number} play - サウンドの再生回数
 */
function updateSoundData(directorId, channelId, play){
  // ディレクターとしての初期化が完了していない場合リモートに送信しない
  if(isDirectorInitialized !== true){return;}
  // カーソル位置やスクロール位置
  const cursor = audioEditor.selection.getCursor();
  const scrollTop = audioEditor.session.getScrollTop();
  const soundData = {
    cursor: `${cursor.row}|${cursor.column}|${scrollTop}`,
    source: audioEditor.getValue(),
    play: play,
  };
  fire.updateChannelData(directorId, channelId, null, soundData);
}

/**
 * スターアイコンを表示する
 */
function showStarIcon(){
  const wrap = document.querySelector('#stariconwrap');
  wrap.classList.add('visible');
}

/**
 * 視聴者アイコンを表示する
 */
function showViewerIcon(){
  const wrap = document.querySelector('#eyeiconwrap');
  wrap.classList.add('visible');
}

/**
 * スクロール同期スイッチを表示する
 */
function showSyncScrollSwitch(){
  const sync = document.querySelector('#syncscrollblock');
  sync.classList.remove('invisible');
}

/**
 * スターアイコンを非表示にする
 */
function hideStarIcon(){
  const wrap = document.querySelector('#stariconwrap');
  wrap.classList.remove('visible');
}

/**
 * Author ブロックを非表示にする
 */
function hideAuthorBlock(){
  const author = document.querySelector('#authorblock');
  author.classList.add('invisible');
}

/**
 * スターのカウントを更新する
 * @param {number} count - カウント
 */
function updateStar(count){
  const counter = document.querySelector('#starcounter');
  const overlay = document.querySelector('#staroverlay');
  overlay.classList.remove('popup');
  overlay.classList.add('visible');
  // 既に登録済みのタイマーがある場合はキャンセル
  if(starCounterTimer != null){
    clearTimeout(starCounterTimer);
    counter.textContent = overlay.textContent = zeroPadding(count, 3);
  }
  starCounterTimer = setTimeout(() => {
    counter.textContent = overlay.textContent = zeroPadding(count, 3);
    overlay.classList.add('popup');
  }, 100);
}

/**
 * 視聴者数のカウントを更新する
 * @param {number} count - カウント
 */
function updateViewer(count){
  const counter = document.querySelector('#eyecounter');
  const overlay = document.querySelector('#eyeoverlay');
  overlay.classList.remove('popup');
  overlay.classList.add('visible');
  const clamp = Math.max(count, 0);
  // 既に登録済みのタイマーがある場合はキャンセル
  if(viewerCounterTimer != null){
    clearTimeout(viewerCounterTimer);
    counter.textContent = overlay.textContent = zeroPadding(clamp, 3);
  }
  viewerCounterTimer = setTimeout(() => {
    counter.textContent = overlay.textContent = zeroPadding(clamp, 3);
    overlay.classList.add('popup');
  }, 100);
}

/**
 * 数値をゼロ埋めする
 * @param {number} number - 数値
 * @param {number} count - 桁数
 * @return {string}
 */
function zeroPadding(number, count){
  const len = '' + number;
  return (new Array(count).join('0') + number).substr(-Math.max(count, len.length));
}

/**
 * メニューの状態を変更する
 * @param {string} directorName - ディレクター名
 */
function hideMenu(directorName){
  const broadcastBlock = document.querySelector('#broadcastblock');
  broadcastBlock.classList.remove('invisible');
  const broadcastCaption = broadcastBlock.querySelector('.menublockinner');
  broadcastCaption.textContent = directorName;
  const soundBlock = document.querySelector('#soundblock');
  soundBlock.classList.add('invisible');
  const exportBlock = document.querySelector('#exportblock');
  exportBlock.classList.add('invisible');
  disableRegulation();
}

/**
 * モード選択ドロップダウンリストを disabled に設定する
 */
function disableRegulation(){
  const select = document.querySelector('#modeselect');
  select.disabled = true;
}

/**
 * 自家製ダイアログを表示する
 * @param {string|HTMLElement} message - 表示するメッセージの文字列か append する DOM
 * @param {object}
 * @property {string} [okLabel='ok'] - ok ボタンに表示する文字列
 * @property {string} [cancelLabel='cancel'] - cancel ボタンに表示する文字列
 * @property {boolean} [okVisible=true] - ok ボタンを表示するかどうか
 * @property {boolean} [cancelVisible=true] - cancel ボタンを表示するかどうか
 * @property {boolean} [okDisable=false] - ok ボタンに disabled を設定するかどうか
 * @property {boolean} [cancelDisable=false] - cancel ボタンに disabled を設定するかどうか
 * @return {Promise} - ok, cancel のいずれかのボタンが押されたときに解決する Promise
 */
function showDialog(message, option){
  // ダイアログの各ボタンには、毎回イベントを設定してボタン押下時に解除する
  const dialogOption = Object.assign({
    okLabel: 'ok',
    cancelLabel: 'cancel',
    okVisible: true,
    cancelVisible: true,
    okDisable: false,
    cancelDisable: false,
  }, option);
  return new Promise((resolve) => {
    // ダイアログ上にメッセージを設定しレイヤを表示する
    while(dialog.firstChild != null){
      dialog.removeChild(dialog.firstChild);
    }
    // 文字列か DOM かによって分岐
    if(message instanceof HTMLElement === true){
      dialog.appendChild(message);
    }else{
      const sentence = message.split('\n');
      sentence.forEach((s) => {
        const div = document.createElement('div');
        div.textContent = s;
        dialog.appendChild(div);
      });
    }
    const ok = document.querySelector('#dialogbuttonok');
    const cancel = document.querySelector('#dialogbuttoncancel');
    // 表示されるラベルの設定
    ok.textContent = dialogOption.okLabel;
    cancel.textContent = dialogOption.cancelLabel;
    // 可視化するかどうかの設定
    if(dialogOption.okVisible === true){
      ok.classList.remove('invisible');
    }else{
      ok.classList.add('invisible');
    }
    if(dialogOption.cancelVisible === true){
      cancel.classList.remove('invisible');
    }else{
      cancel.classList.add('invisible');
    }
    // disabled かどうかとイベントの付与
    if(dialogOption.okDisable === true){
      ok.classList.add('disabled');
    }else{
      ok.classList.remove('disabled');
      const okClick = () => {
        ok.removeEventListener('click', okClick);
        resolve(true);
        hideDialog();
      };
      ok.addEventListener('click', okClick, false);
    }
    if(dialogOption.cancelDisable === true){
      cancel.classList.add('disabled');
    }else{
      cancel.classList.remove('disabled');
      const cancelClick = () => {
        cancel.removeEventListener('click', cancelClick);
        resolve(false);
        hideDialog();
      };
      cancel.addEventListener('click', cancelClick, false);
    }

    setLayerVisible(true);
  });
}

/**
 * ダイアログ（及びレイヤ）を非表示にする
 */
function hideDialog(){
  setLayerVisible(false);
}

/**
 * フロートレイヤの表示状態を設定する
 * @param {boolean} visible - 表示するかどうかのフラグ
 */
function setLayerVisible(visible){
  if(visible === true){
    layer.classList.add('visible');
  }else{
    layer.classList.remove('visible');
  }
}

/**
 * フルスクリーンを解除する（DOM 操作はしない）
 */
function exitFullscreen(){
  if(
    document.fullscreenEnabled !== true &&
    document.webkitFullscreenEnabled !== true
  ){
    return;
  }
  // 一度変数にキャッシュしたりすると Illegal invocation になるので直接呼ぶ
  if(document.exitFullsScreen != null){
    document.exitFullscreen();
  }else if(document.webkitExitFullscreen != null){
    document.webkitExitFullscreen();
  }
}

/**
 * フルスクリーンを解除後の DOM 操作とエディタ領域のリサイズのみを行う
 */
function exitFullscreenMode(){
  canvasWrap.classList.remove('fullscreen');
  editorWrap.classList.remove('invisible');
  iconColumn.classList.remove('invisible');
  editor.resize();
  audioEditor.resize();
  resize();
  fragmen.rect();
}

/**
 * フルスクリーンモードへ移行しエディタ領域をリサイズする
 */
function requestFullscreenMode(){
  if(
    document.fullscreenEnabled !== true &&
    document.webkitFullscreenEnabled !== true
  ){
    return;
  }
  // 一度変数にキャッシュしたりすると Illegal invocation になるので直接呼ぶ
  if(document.body.requestFullscreen != null){
    document.body.requestFullscreen();
    canvasWrap.classList.add('fullscreen');
    editorWrap.classList.add('invisible');
    iconColumn.classList.add('invisible');
  }else if(document.body.webkitRequestFullScreen != null){
    document.body.webkitRequestFullScreen();
    canvasWrap.classList.add('fullscreen');
    editorWrap.classList.add('invisible');
    iconColumn.classList.add('invisible');
  }
  editor.resize();
  audioEditor.resize();
  resize();
  fragmen.rect();
}


})();



