/* **********************************************************************
* 
*  Name: llsif_cardviewer.js
*
*  Description: LLSIF Card Viewer Module
*  Author: chieri0611
*  Create: 2022/04/01
*  Update: 2022/04/03
*
********************************************************************** */


/* ======================================================================
*
*  Constants
*
*  Deck Setting
*    [-] initCardViewer
*    [-] loadDeck
*    [-] viewDeck
*    [-] saveDeck
*    [-] resetDeck
*    [-] setDeckMember
*    [-] resetDeckMember
*    [-] setGuestMember
*    [-] resetGuestMember
*    [-] changePosition
*    [-] setCenterSkillName
*    [-] calcDeckParameter
*
*  Conversion
*    [-] toIconAssetPath
*    [-] toIconFrameAssetPath
*    [-] toCardAssetPath
*    [-] toMemberName
*    [-] toSkillType
*    [-] toSkillDesc
*    [-] toCenterSkillName
*    [-] toCenterSkillDesc
*
*  Card Detail
*    [-] getCardParameter
*    [-] showCardDetail
*
*  Card Search
*    [-] viewCardList
*    [-] searchCardList
*    [-] sortCardList
*  
====================================================================== */


  var DB_SERVER, ASSET_PATH;
  if(location.hostname == 'localhost') {
    DB_SERVER = "/LLSIF_DATA/"; ASSET_PATH = '/Github/llsif/assets/';
  } else {
    DB_SERVER = "https://llsif.gamedbs.jp/images/"; ASSET_PATH = '/llsif/assets/';
  }

  const VIEW_PAGEITEM = 20;
  const SORT_CRITERIA = { ID: 1, SMILE: 2, PURE: 3, COOL: 4, TRIGGER: 5, CHANCE: 6, DURATION: 7, VALUE: 8, VALUE_MAX: 9 };

  const MAX_UNIT = 9;
  const MAX_SKILL = 8;

  const RARITY = { N: 1, R: 2, SR: 3, UR: 4, SSR: 5 };
  const ATTR = { SMILE: 1, PURE: 2, COOL: 3 };
  const GROUP = { MUSE: 1, AQOURS: 2, NIJIGAKU: 3, LIELLA: 4 };
  const SUBUNIT = { PRINTEMPS: 1, LILYWHITE: 2, BIBI: 3, CYARON: 4, AZELEA: 5, GUILTYKISS: 6 };
  const TENNYUSEI = [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,41,42,43,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68];
  const EFFECT_TARGET = { GROUP: 1, GRADE: 2, SUBUNIT: 3, GROUPGRADE: 4, MEMBER: 5 };
  const SKILL = { TIMINGBOOST_S: 4, TIMINGBOOST_L: 5, RECOVERY: 9, SCOREUP: 11, SKILLCHANCE: 2000, SKILLREPEAT: 2100, PERFECTUP: 2201, COMBOFEVER: 2300, PARAMSYNC: 2400, SKILLBOOST: 2500, PARAMUP: 2600 };
  const TRIGGER = { TIMER: 1, ICON: 3, COMBO: 4, SCORE: 5, PERFECT: 6, STARICON: 12, CHAIN: 100 };
  const LEADER_SKILL = { NONE: 0, SMILE: 1, PURE: 2, COOL: 3, PUREPRINCESS: 112, COOLPRINCESS: 113, SMILEANGEL: 121, COOLANGEL: 123, SMILEEMPRESS: 131, PUREEMPRESS: 132 };

  const ATTR_NAME = { "1": "スマイル", "2": "ピュア", "3": "クール" };
  const GROUP_NAME = { "1": "μ's", "2": "Aqours", "3": "虹ヶ咲", "4": "Liella!" };
  const SUBUNIT_NAME = { "1": "Printemps", "2": "lily white", "3": "BiBi", "4": "CYaRon！", "5": "AZALEA", "6": "Guilty Kiss" };
  const SKILL_NAME = { "4": "判定強化(小)", "5": "判定強化(大)", "9": "体力回復", "11": "SCOREアップ", "2000": "特技発動率アップ", "2100": "特技リピート", "2201": "PERFECT SCOREアップ", "2300": "COMBO FEVER", "2400": "パラメータシンクロ", "2500": "特技レベルブースト", "2600": "パラメータアップ" };

  var param_diff, cards_data, members_data, idolskills_data, accessories_data;
  var llsif, deckdata, carddata, guestdata;


/* ----------------------------------------------------------------------
*  Deck Setting
---------------------------------------------------------------------- */

/* initCardViewer
====================================================================== */
function initCardViewer(success_func) {
  const dbdir = location.hostname == 'localhost' ? '/Github/llsif/db/' : 'llsif/db/';
  var files = [dbdir + 'param_diff.json', dbdir + 'cards.json', dbdir + 'members.json', dbdir + 'idol_skill.json', dbdir + 'accessories.json'];

  var urlquery = getURLQueryParam();
  var nocache = urlquery.hasOwnProperty('cache') ? urlquery.cache == '0' : false;

  loadAllFiles(files, nocache, function(response) {
    param_diff = JSON.parse(response[0]); cards_data = JSON.parse(response[1]); members_data = JSON.parse(response[2]);
    idolskills_data = JSON.parse(response[3]); accessories_data = JSON.parse(response[4]);
    success_func();
  });
}


/* loadDeck
====================================================================== */
function loadDeck(decknumber) {
  if(!cards_data) return;

  if(llsif == null) llsif = new LLSIF_ScoreCalc();

  //ユニット情報読込
  var _deck = localStorage.getItem('llsif_deck');
  if(_deck == null) {
    _deck = {
      decks:[
        {
          number: 1,
          deck: [
            {lv:0,id:0,pos:1,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:2,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:3,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:4,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:5,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:6,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:7,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:8,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]},
            {lv:0,id:0,pos:9,i:false,b:0,sk:0,a_id:0,a_lv:0,sis:[]}
          ],
          guest: 0
        }
      ]
    };
    localStorage.setItem('llsif_deck', JSON.stringify(_deck));
    return;
  }
  _deck = JSON.parse(_deck);

  _deck = _deck.decks.find(function(elem) { return elem.number == decknumber; });
  deckdata = _deck
  carddata = new Array(llsif.MAX_UNIT); guestdata = 0;
}


/* viewDeck
====================================================================== */
function viewDeck(elem_deck, elem_guest) {
  if(!deckdata) return;

  if(elem_deck) {
    deckdata.deck.forEach(function(mem_obj) {
      var mem_elem = elem_deck.querySelector('[data-position="' + mem_obj.pos + '"]');
      if(mem_obj.id != 0) {
        setDeckMember(mem_obj, mem_elem);
      } else {
        resetDeckMember(mem_obj.pos, mem_elem);
      }
    });
  }

  if(elem_guest) {
    if(deckdata.guest != 0) {
      setGuestMember(deckdata.guest, elem_guest);
    } else {
      resetGuestMember(elem_guest);
    }
  }
}


/* saveDeck
====================================================================== */
function saveDeck(decknumber) {
  var _decks = JSON.parse(localStorage.getItem('llsif_deck'));

  _decks.decks.forEach(function(elem, idx) {
    if(_decks.decks[idx].number == decknumber) _decks.decks[idx] = deckdata;
  });

  localStorage.setItem('llsif_deck', JSON.stringify(_decks));
}


/* resetDeck
====================================================================== */
function resetDeck(decknumber) {
  var _decks = JSON.parse(localStorage.getItem('llsif_deck'));

  deckdata.deck = deckdata.deck.map(function(elem) {
    elem.lv = 0; elem.id = 0; elem.i = false; elem.b = 0;
    elem.sk = 0; elem.a_id = 0; elem.a_lv = 0; elem.sis = [];
    llsif.deckMember[elem.pos - 1].reset(); return elem;
  });
  deckdata.guest = 0;
  carddata = new Array(llsif.MAX_UNIT); guestdata = 0;

  _decks.decks.forEach(function(elem, idx) {
    if(_decks.decks[idx].number == decknumber) _decks.decks[idx] = deckdata;
  });

  localStorage.setItem('llsif_deck', JSON.stringify(_decks));
}


/* setDeckMember
====================================================================== */
function setDeckMember(mem_obj, mem_elem) {
  var icon_elem = mem_elem.querySelector('.member_img');
  var frame_elem = mem_elem.querySelector('.member_frame');
  var lv_elem = mem_elem.querySelector('.member_level');

  var card = cards_data.cards.find(function(elem) { return elem.i == mem_obj.id; });

  var diff = param_diff.pattern.find(function(elem) { return elem.i == card.v; });
  diff = diff.p.find(function(elem) { return elem.l == mem_obj.lv; });

  var member = llsif.deckMember[mem_obj.pos - 1];
  member.unit_id = mem_obj.id;
  member.level = mem_obj.lv; member.attr = card.a; member.life = card.h + diff.h;
  member.smile = card.s + diff.s; member.pure = card.p + diff.p; member.cool = card.c + diff.c;
  member.bond = mem_obj.b; member.idolized = mem_obj.i;
  member.member_id = card.u;

  if(card.l != 0) {
    member.center_skill.effect_type = card.l.t;
    member.center_skill.effect_value = Decimal.div(card.l.v, 100);
    member.center_skill.effect_value_extra = Decimal.div(card.l.x, 100);
    member.center_skill.effect_type_extra = card.l.e;
    member.center_skill.effect_target1 = card.l.a;
    member.center_skill.effect_target2 = card.l.b;
  }

  member.skill_type = card.y;
  member.skill_trigger = card.t;
  if(card.y != 0) {
    card.k.forEach(function(elem) { member.appendSkill(elem.t, elem.r, elem.s, elem.v); });
  }
  member.skill_level = mem_obj.sk;
  if(card.e != 0) {
    member.skill_effect_target = card.e[0];
    switch(card.e[0]) {
      case llsif.EFFECT_TARGET.SUBUNIT:
        member.skill_effect_group = 0;
        member.skill_effect_grade = 0;
        member.skill_effect_subunit = card.e[1];
        break;
      case llsif.EFFECT_TARGET.GROUPGRADE:
        member.skill_effect_group = card.e[1];
        member.skill_effect_grade = card.e[2];
        member.skill_effect_subunit = 0;
        break;
    }
  }

  member.max_idol_skill = card.f; member.default_idol_skill = card.b;

  carddata[mem_obj.pos - 1] = card;

  lv_elem.textContent = mem_obj.lv;
  icon_elem.src = toIconAssetPath(card, mem_obj.i);
  frame_elem.src = toIconFrameAssetPath(card);
  toggleClass(mem_elem, 'idol_skill', mem_obj.sis.length > 0);
  toggleClass(mem_elem, 'blank', false);
}


/* resetDeckMember
====================================================================== */
function resetDeckMember(mem_pos, mem_elem) {
  llsif.deckMember[mem_pos - 1].reset();
  carddata[mem_pos - 1] = null;

  var icon_elem = mem_elem.querySelector('.member_img');
  var frame_elem = mem_elem.querySelector('.member_frame');
  var lv_elem = mem_elem.querySelector('.member_level');

  lv_elem.textContent = '';
  icon_elem.src = ASSET_PATH + 'member_blank.png';
  frame_elem.src = '';
  toggleClass(mem_elem, 'idol_skill', false);
  toggleClass(mem_elem, 'blank', true);
}


/* setGuestMember
====================================================================== */
function setGuestMember(mem_id, mem_elem) {
  var icon_elem = mem_elem.querySelector('.member_img');
  var frame_elem = mem_elem.querySelector('.member_frame');

  var card = cards_data.cards.find(function(elem) { return elem.i == mem_id; });

  var member = llsif.guestMember;
  member.unit_id = mem_id;
  if(card.l != 0) {
    member.center_skill.effect_type = card.l.t;
    member.center_skill.effect_value = Decimal.div(card.l.v, 100);
    member.center_skill.effect_value_extra = Decimal.div(card.l.x, 100);
    member.center_skill.effect_type_extra = card.l.e;
    member.center_skill.effect_target1 = card.l.a;
    member.center_skill.effect_target2 = card.l.b;
  }

  guestdata = card;
  icon_elem.src = toIconAssetPath(card, false);
  frame_elem.src = toIconFrameAssetPath(card);
  toggleClass(mem_elem, 'blank', false);
}


/* resetGuestMember
====================================================================== */
function resetGuestMember(mem_elem) {
  llsif.guestMember.reset(); guestdata = 0;

  var icon_elem = mem_elem.querySelector('.member_img');
  var frame_elem = mem_elem.querySelector('.member_frame');

  icon_elem.src = ASSET_PATH + 'member_blank.png';
  frame_elem.src = '';
  toggleClass(mem_elem, 'idol_skill', false);
  toggleClass(mem_elem, 'blank', true);
}


/* changePosition
====================================================================== */
function changePosition(from_pos, to_pos, elem_deck) {
  llsif.deckMember[from_pos - 1].move(to_pos);

  var temp = deckdata.deck[to_pos - 1];
  deckdata.deck[to_pos - 1] = deckdata.deck[from_pos - 1]; deckdata.deck[from_pos - 1] = temp;
  deckdata.deck[to_pos - 1].pos = to_pos; deckdata.deck[from_pos - 1].pos = from_pos;

  var temp = carddata[to_pos - 1];
  carddata[to_pos - 1] = carddata[from_pos - 1]; carddata[from_pos - 1] = temp;

  viewDeck(elem_deck);
}


/* setCenterSkillName
====================================================================== */
function setCenterSkillName(obj, card) {
  var name_elem = obj.querySelector('.center_skill_name');
  var desc_elem = obj.querySelector('.center_skill_desc');

  name_elem.textContent = toCenterSkillName(card);
  desc_elem.textContent = toCenterSkillDesc(card);
}


/* calcDeckParameter
====================================================================== */
function calcDeckParameter(obj, guest, idol_skill) {
  var life_elem1 = obj.querySelector('#deck_life');
  var life_elem2 = obj.querySelector('#deck_life_plus');
  var smile_elem1 = obj.querySelector('#deck_smile');
  var smile_elem2 = obj.querySelector('#deck_smile_plus');
  var pure_elem1 = obj.querySelector('#deck_pure');
  var pure_elem2 = obj.querySelector('#deck_pure_plus');
  var cool_elem1 = obj.querySelector('#deck_cool');
  var cool_elem2 = obj.querySelector('#deck_cool_plus');

  var param = llsif.deckParameter(guest, idol_skill);
  life_elem1.textContent = sumArray(param.life); life_elem2.textContent = 0;
  smile_elem1.textContent = sumArray(param.smile); smile_elem2.textContent = sumArray(param.smile_center_skill);
  pure_elem1.textContent = sumArray(param.pure); pure_elem2.textContent = sumArray(param.pure_center_skill);
  cool_elem1.textContent = sumArray(param.cool); cool_elem2.textContent = sumArray(param.cool_center_skill);
}



/* ----------------------------------------------------------------------
*  Conversion
---------------------------------------------------------------------- */

/* toIconAssetPath
====================================================================== */
function toIconAssetPath(card, idolized) {
  const idol_type = card.o || idolized ? 'rankup_icon' : 'normal_icon';
  switch(card.d[0]) {
    case 1: return DB_SERVER + 'assets/image/units/u_' + idol_type + '_' + card.d[1] + '.png'; break;
    case 2: return DB_SERVER + 'assets/image/unit/' + card.d[1] + '/u_' + card.d[1] + '_' + idol_type + '.png'; break;
    case 3: return DB_SERVER + 'assets/image/unit/' + card.d[1] + '/u_' + idol_type + '_' + card.d[1] + '.png'; break;
  }
}

/* toIconFrameAssetPath
====================================================================== */
function toIconFrameAssetPath(card) {
  var frame_asset = '';
  switch(card.r) {
    case RARITY.UR: frame_asset = choose(card.a, 'ur_smile.png', 'ur_pure.png', 'ur_cool.png'); break;
  }
  return ASSET_PATH + frame_asset;
}

/* toCardAssetPath
====================================================================== */
function toCardAssetPath(card, idolized) {
  if(location.hostname == 'localhost') {
    const idol_type = card.o || idolized ? 'b_rankup' : 'b_normal';
    switch(card.d[0]) {
      case 1: return DB_SERVER + 'assets/image/units/' + idol_type + '_' + card.d[1] + '.png'; break;
      case 2: return DB_SERVER + 'assets/image/unit/' + card.d[1] + '/' + card.d[1] + '_' + idol_type + '.png'; break;
      case 3: return DB_SERVER + 'assets/image/unit/' + card.d[1] + '/' + idol_type + '_' + card.d[1] + '.png'; break;
    }
  } else {
    const idol_type = card.o || idolized ? 'r' : 'n';
    return DB_SERVER + 'gcard/' + card.i + idol_type + '.jpg';
  }
}

/* toMemberName
====================================================================== */
function toMemberName(card, shortname) {
  if(!members_data) return '';

  var mem_data = members_data.members.find(function(elem) { return elem.u == card.u; });
  if(!mem_data) return '';
  return shortname ? mem_data.s : mem_data.n;
}

/* toSkillType
====================================================================== */
function toSkillType(card) {
  if(!card) return '無し';
  if(Object.values(SKILL).indexOf(card.y) == -1) return '無し';
  return SKILL_NAME[String(card.y)];
}

/* toSkillDesc
====================================================================== */
function toSkillDesc(card, skill_level) {
  if(!card) return '';
  if(card.y == 0) return '無し';
  if(skill_level == 'max') skill_level = card.k.length;
  if(skill_level > card.k.length || skill_level < 1) return '';

  var sk = card.k[skill_level - 1];

  var sk_target = '';
  if(card.e != 0) {
    switch(card.e[0]) {
      case EFFECT_TARGET.SUBUNIT:
        if(Object.values(SUBUNIT).indexOf(card.e[1]) != -1) sk_target = SUBUNIT_NAME[String(card.e[1])]; break;
      case EFFECT_TARGET.GROUPGRADE:
        if(Object.values(GROUP).indexOf(card.e[1]) != -1) sk_target = GROUP_NAME[String(card.e[1])] + card.e[2] + '年生';
        break;
    }
  }

  var sk_trigger = '', sk_chance = sk.r + '%の確率で';
  switch(card.t) {
    case TRIGGER.TIMER:    sk_trigger = sk.t + '秒ごとに'; break;
    case TRIGGER.ICON:     sk_trigger = 'リズムアイコン' + sk.t + '個ごとに'; break;
    case TRIGGER.COMBO:    sk_trigger = 'コンボ' + sk.t + 'を達成するごとに'; break;
    case TRIGGER.SCORE:    sk_trigger = 'スコア' + sk.t + '達成ごとに'; break;
    case TRIGGER.PERFECT:  sk_trigger = 'PERFECTを' + sk.t + '回達成するごとに'; break;
    case TRIGGER.STARICON: sk_trigger = 'スターアイコンPERFECT' + sk.t + '回ごとに'; break;
    case TRIGGER.CHAIN:    sk_trigger = '自身を除く' + sk_target + 'の特技がすべて発動すると'; break;
    default: return '';
  }

  var skill_desc;
  switch(card.y) {
    case SKILL.TIMINGBOOST_S:
      skill_desc = sk_trigger + sk_chance + '判定が' + sk.s + '秒間少し強化される'; break;
    case SKILL.TIMINGBOOST_L:
      skill_desc = sk_trigger + sk_chance + '判定が' + sk.s + '秒間強化される'; break;
    case SKILL.RECOVERY:
      skill_desc = sk_trigger + sk_chance + '体力が' + sk.v + '回復する'; break;
    case SKILL.SCOREUP:
      skill_desc = sk_trigger + sk_chance + 'スコアが' + sk.v + '増える'; break;
    case SKILL.SKILLCHANCE:
      skill_desc = sk_trigger + sk_chance + sk.s + '秒間他の特技の発動確率が' + sk.v + '倍になる'; break;
    case SKILL.SKILLREPEAT:
      skill_desc = sk_trigger + sk_chance + '直前に発動した特技リピート以外の特技効果を発動する'; break;
    case SKILL.PERFECTUP:
      skill_desc = sk_trigger + sk_chance + sk.s + '秒間PERFECT時のタップSCOREが' + sk.v + '増える'; break;
    case SKILL.COMBOFEVER:
      skill_desc = sk_trigger + sk_chance + sk.s + '秒間コンボ数に応じてタップSCOREが増える(' + sk.v + '～' + (sk.v * 10) + 'の間で変動)'; break;
    case SKILL.PARAMSYNC:
      skill_desc = sk_trigger + sk_chance + sk.s + '秒間' + sk_target + 'のいずれかと同じ属性Pになる'; break;
    case SKILL.SKILLBOOST:
      skill_desc = sk_trigger + sk_chance + '次に発動する特技のLvが' + sk.v + 'アップする'; break;
    case SKILL.PARAMUP:
      skill_desc = sk_trigger + sk_chance + sk.s + '秒間' + sk_target + 'の属性Pが' + sk.v + '%UPする'; break;
    default: return '無し';
  }

  if(card.hasOwnProperty('li')) { if(card.li > 0) skill_desc += '(最大' + card.li + '回まで)'; }
  return skill_desc;
}

/* toCenterSkillName
====================================================================== */
function toCenterSkillName(card) {
  return '';
}


/* toCenterSkillDesc
====================================================================== */
function toCenterSkillDesc(card) {
  var cs_desc, e_attr;

  if(!members_data) return '';
  if(!card) return '無し';
  if(card.l == 0) return '無し';
  switch(card.l.t) {
    case LEADER_SKILL.SMILE:
      e_attr = ATTR_NAME[ATTR.SMILE]; cs_desc = 'スマイルPが' + card.l.v + '%UPする'; break;
    case LEADER_SKILL.PURE:
      e_attr = ATTR_NAME[ATTR.PURE]; cs_desc = 'ピュアPが' + card.l.v + '%UPする'; break;
    case LEADER_SKILL.COOL:
      e_attr = ATTR_NAME[ATTR.COOL]; cs_desc = 'クールPが' + card.l.v + '%UPする'; break;
    case LEADER_SKILL.PUREPRINCESS:
      e_attr = ATTR_NAME[ATTR.PURE]; cs_desc = 'スマイルPの' + card.l.v + '%分ピュアPがUPする'; break;
    case LEADER_SKILL.COOLPRINCESS:
      e_attr = ATTR_NAME[ATTR.COOL]; cs_desc = 'スマイルPの' + card.l.v + '%分クールPがUPする'; break;
    case LEADER_SKILL.SMILEANGEL:
      e_attr = ATTR_NAME[ATTR.SMILE]; cs_desc = 'ピュアPの' + card.l.v + '%分スマイルPがUPする'; break;
    case LEADER_SKILL.COOLANGEL:
      e_attr = ATTR_NAME[ATTR.COOL]; cs_desc = 'ピュアPの' + card.l.v + '%分クールPがUPする'; break;
    case LEADER_SKILL.SMILEEMPRESS:
      e_attr = ATTR_NAME[ATTR.SMILE]; cs_desc = 'クールPの' + card.l.v + '%分スマイルPがUPする'; break;
    case LEADER_SKILL.PUREEMPRESS:
      e_attr = ATTR_NAME[ATTR.PURE]; cs_desc = 'クールPの' + card.l.v + '%分ピュアPがUPする'; break;
  }

  var cs_desc_ex = '';
  switch(card.l.e) {
    case EFFECT_TARGET.GROUP:
      cs_desc_ex = GROUP_NAME[card.l.a]; break;
    case EFFECT_TARGET.GRADE:
      cs_desc_ex = card.l.a + '年生'; break;
    case EFFECT_TARGET.SUBUNIT:
      cs_desc_ex = SUBUNIT_NAME[card.l.a]; break;
    case EFFECT_TARGET.MEMBER:
      var mem_data1 = members_data.members.find(function(elem) { return elem.u == card.l.a; });
      var mem_data2 = members_data.members.find(function(elem) { return elem.u == card.l.b; });
      cs_desc_ex = mem_data1.s;
      if(card.l.b != 0) cs_desc_ex += '、' + mem_data2.s;
      break;
  }
  if(cs_desc_ex != '') cs_desc_ex = '＋' + cs_desc_ex + 'のメンバーはさらに' + e_attr + 'Pが' + card.l.x + '%UPする';

  return cs_desc + cs_desc_ex;
}



/* ----------------------------------------------------------------------
*  Card Detail
---------------------------------------------------------------------- */

/* getCardParameter
====================================================================== */
function getCardParameter(card, level, bond) {
  var diff = param_diff.pattern.find(function(elem) { return elem.i == card.v; });
  diff = diff.p.find(function(elem) { return elem.l == level; });

  var param = new Object;
  param.life = card.h + diff.h;
  param.smile = card.s + diff.s; param.pure = card.p + diff.p; param.cool = card.c + diff.c;
  switch(card.a) {
    case ATTR.SMILE: param.smile += bond; break;
    case ATTR.PURE:  param.pure += bond; break;
    case ATTR.COOL:  param.cool += bond; break;
  }
  return param;
}


/* showCardDetail
====================================================================== */
function showCardDetail(card, deckmem, getparam, update_func) {
  var detail_elem = document.createElement('div');

  detail_elem.innerHTML = 
    '<div class="image_block">' +
      '<img id="data_cardimg" class="card_image" />' +
      '<div class="idolized_switch">' +
        '<div class="switch_button idolized">' +
          '<input type="radio" name="card_idolized" id="card_normal" value="normal" onchange="" />' +
          '<label for="card_normal">通常</label>' +
          '<input type="radio" name="card_idolized" id="card_idolized" value="idolized" onchange="" />' +
          '<label for="card_idolized">覚醒</label>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="detail_block">' +
      '<div class="detail_frame">' +
        '<div id="data_eponym" class="detail_title"></div>' +
        '<div id="data_member" class="card_detail text"></div>' +
      '</div>' +

      '<div class="detail_frame">' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">Lv</div>' +
          '<div class="detail_desc">' +
            '<div class="spin_box">' +
              '<button class="spindown_button"></button>' +
              '<input id="data_level" type="number" class="spin_value" min="1" readonly="readonly"/>' +
              '<button class="spinup_button"></button>' +
            '</div>' +
            '<div id="data_level_max" class="detail_text"></div>' +
            '<div class="min_max_button">' +
              '<button id="level_min" class="min_button"></button>' +
              '<button id="level_max" class="max_button"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">絆</div>' +
          '<div class="detail_desc">' +
            '<div class="spin_box">' +
              '<button class="spindown_button"></button>' +
              '<input id="data_bond" type="number" class="spin_value" min="0" readonly="readonly"/>' +
              '<button class="spinup_button"></button>' +
            '</div>' +
            '<div id="data_bond_max" class="detail_text"></div>' +
            '<div class="min_max_button">' +
              '<button id="bond_min" class="min_button"></button>' +
              '<button id="bond_max" class="max_button"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="param_life"><span id="data_life" class="param_num"></span></div>' +
          '<div class="param_smile"><span id="data_smile" class="param_num"></span></div>' +
          '<div class="param_pure"><span id="data_pure" class="param_num"></span></div>' +
          '<div class="param_cool"><span id="data_cool" class="param_num"></span></div>' +
        '</div>' +
      '</div>' +

      '<div class="detail_frame">' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">特技</div><div id="data_skilltype" class="detail_desc"></div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">特技名</div><div id="data_skillname" class="detail_desc"></div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">特技Lv</div>' +
          '<div class="detail_desc">' +
            '<div class="spin_box">' +
              '<button class="spindown_button"></button>' +
              '<input id="data_skilllevel" type="number" class="spin_value" min="1" readonly="readonly"/>' +
              '<button class="spinup_button"></button>' +
            '</div>' +
            '<div id="data_skilllevel_max" class="detail_text"></div>' +
            '<div class="min_max_button">' +
              '<button id="skilllevel_min" class="min_button"></button>' +
              '<button id="skilllevel_max" class="max_button"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">効果</div><div id="data_skilldesc" class="detail_desc small"></div>' +
        '</div>' +
        '<div class="card_detail">' +
          '<div class="detail_name">センタースキル</div><div id="data_centerskill" class="detail_desc small"></div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">部員No.</div><div id="data_memberid" class="detail_desc small"></div>' +
        '</div>' +
      '</div>' +
    '</div>';


  if(deckmem == null) getparam = false;
  var diff = param_diff.pattern.find(function(elem) { return elem.i == card.v; });
  var level_max, level_maxup, bond_max; 
  if(getparam) {
    level_max = card.o || deckmem.i ? diff.a : diff.b;
    level_maxup = card.o || deckmem.i ? diff.p[diff.p.length - 1].l : diff.b;
    bond_max = card.o || deckmem.i ? diff.o : diff.l;
  } else {
    level_max = card.o ? diff.a : diff.b;
    level_maxup = card.o ? diff.p[diff.p.length - 1].l : diff.b;
    bond_max = card.o ? diff.o : diff.l;
  }
  const sklevel_max = card.k[card.k.length - 1].l;
  const level = getparam ? deckmem.lv : 1, bond = getparam ? deckmem.b : 0;
  var param = getCardParameter(card, level, bond);


  function change_cardidolized(radio) {
    if(!radio.checked) return;
    const new_idolized = radio.value == 'idolized';
    const get_level = parseFloat(document.getElementById('data_level').value);
    const get_bond = parseFloat(document.getElementById('data_bond').value);
    var new_levelmax = new_idolized ? diff.a : diff.b;
    const new_bondmax = new_idolized ? diff.o : diff.l;

    document.getElementById('data_cardimg').src = toCardAssetPath(card, new_idolized);
    document.getElementById('data_level_max').textContent = '/' + new_levelmax;
    document.getElementById('data_bond_max').textContent = '/' + new_bondmax;

    new_levelmax = new_idolized ? diff.p[diff.p.length - 1].l : diff.b;
    var input = document.getElementById('data_level');
    if(parseFloat(input.value) > new_levelmax) {
      input.value = new_levelmax; input.max = new_levelmax; change_maxvalue('data_level');
    }
    input.max = new_levelmax;

    input = document.getElementById('data_bond');
    if(parseFloat(input.value) > new_bondmax) {
      input.value = new_bondmax; input.max = new_bondmax; ichange_maxvalue('data_bond');
    }
    input.max = new_bondmax;
  }

  function change_card_param() {
    const new_level = parseFloat(document.getElementById('data_level').value);
    const new_bond = parseFloat(document.getElementById('data_bond').value);
    const new_param = getCardParameter(card, new_level, new_bond);
    document.getElementById('data_life').textContent = new_param.life;
    document.getElementById('data_smile').textContent = new_param.smile;
    document.getElementById('data_pure').textContent = new_param.pure;
    document.getElementById('data_cool').textContent = new_param.cool;
  }

  function change_minvalue(elemid) {
    var input = document.getElementById(elemid); input.value = input.min; input.onchange();
    input.parentNode.querySelector('.spindown_button').disabled = true;
    input.parentNode.querySelector('.spinup_button').disabled = false;
  }

  function change_maxvalue(elemid) {
    var input = document.getElementById(elemid); input.value = input.max; input.onchange();
    input.parentNode.querySelector('.spindown_button').disabled = false;
    input.parentNode.querySelector('.spinup_button').disabled = true;
  }

  function change_maxlevel() {
    var input = document.getElementById('data_level');
    if(document.getElementById('card_idolized').checked) {
      input.value = parseFloat(input.value) >= diff.a ? input.max : diff.a;
    } else {
      input.value = input.max;
    }
    input.onchange();
    input.parentNode.querySelector('.spindown_button').disabled = false;
    input.parentNode.querySelector('.spinup_button').disabled = input.value == input.max;
  }

  function change_maxskill() {
    var input = document.getElementById('data_skilllevel');
    input.value = parseFloat(input.value) >= MAX_SKILL ? input.max : MAX_SKILL;
    input.onchange();
    input.parentNode.querySelector('.spindown_button').disabled = false;
    input.parentNode.querySelector('.spinup_button').disabled = input.value == input.max;
  }

  function update_deckmember() {
    if(deckmem == null) { closeDialog('card_detail_dlg'); return; }

    const new_level = parseFloat(document.getElementById('data_level').value);
    const new_bond = parseFloat(document.getElementById('data_bond').value);
    const new_sklevel = parseFloat(document.getElementById('data_skilllevel').value);
    const new_idolized = getRadioValue('card_idolized') == 'idolized';

    if(new_sklevel > MAX_SKILL) return;

    deckmem.lv = new_level; deckmem.i = new_idolized; deckmem.b = new_bond; deckmem.sk = new_sklevel; 
    if(deckmem.id != card.i) { deckmem.id = card.i; deckmem.a_id = 0; deckmem.a_lv = 0; deckmem.sis = []; }
    closeDialog('card_detail_dlg'); update_func();
  }

  detail_elem.querySelector('#card_normal').onchange = function() { change_cardidolized(this); }
  detail_elem.querySelector('#card_idolized').onchange = function() { change_cardidolized(this); }

  detail_elem.querySelector('#data_level').onchange = function() { change_card_param(); }
  detail_elem.querySelector('#level_min').onclick = function() { change_minvalue('data_level'); }
  detail_elem.querySelector('#level_max').onclick = function() { change_maxlevel(); }

  detail_elem.querySelector('#data_bond').onchange = function() { change_card_param(); }
  detail_elem.querySelector('#bond_min').onclick = function() { change_minvalue('data_bond'); }
  detail_elem.querySelector('#bond_max').onclick = function() { change_maxvalue('data_bond'); }

  detail_elem.querySelector('#data_skilllevel').onchange = function() {
    document.getElementById('data_skilldesc').textContent = toSkillDesc(card, this.value);
    if(deckmem == null) return;
    var updatebtn = document.getElementById('card_detail_dlg').querySelector('footer > button.exec_button');
    updatebtn.disabled = parseFloat(document.getElementById('data_skilllevel').value) > MAX_SKILL
  }
  detail_elem.querySelector('#skilllevel_min').onclick = function() { change_minvalue('data_skilllevel'); }
  detail_elem.querySelector('#skilllevel_max').onclick = function() { change_maxskill(); }


  detail_elem.querySelector('#data_cardimg').src = toCardAssetPath(card, getparam ? deckmem.i : false);
  if(card.o) detail_elem.querySelector('#card_normal').disabled = true;
  if(card.o || (getparam ? deckmem.i : false)) {
    detail_elem.querySelector('#card_idolized').checked = true;
  } else {
    detail_elem.querySelector('#card_normal').checked = true;
  }

  switch(card.a) {
    case ATTR.SMILE: detail_elem.className = 'detail_bg smile'; break;
    case ATTR.PURE:  detail_elem.className = 'detail_bg pure'; break;
    case ATTR.COOL:  detail_elem.className = 'detail_bg cool'; break;
  }
  detail_elem.querySelector('#data_eponym').textContent = card.n;
  detail_elem.querySelector('#data_member').textContent = toMemberName(card, false);

  detail_elem.querySelector('#data_level').value = level;
  detail_elem.querySelector('#data_level').max = level_maxup;
  detail_elem.querySelector('#data_level_max').textContent = '/' + level_max;
  detail_elem.querySelector('#data_bond').value = bond;
  detail_elem.querySelector('#data_bond').max = bond_max;
  detail_elem.querySelector('#data_bond_max').textContent = '/' + bond_max;

  detail_elem.querySelector('#data_life').textContent = param.life;
  detail_elem.querySelector('#data_smile').textContent = param.smile;
  detail_elem.querySelector('#data_pure').textContent = param.pure;
  detail_elem.querySelector('#data_cool').textContent = param.cool;

  detail_elem.querySelector('#data_skilltype').textContent = toSkillType(card);
  detail_elem.querySelector('#data_skillname').textContent = card.m;
  detail_elem.querySelector('#data_skilllevel').value = getparam ? deckmem.sk : 1;
  detail_elem.querySelector('#data_skilllevel').max = sklevel_max;
  detail_elem.querySelector('#data_skilllevel_max').textContent = '/' + MAX_SKILL;
  detail_elem.querySelector('#data_skilldesc').textContent = toSkillDesc(card, getparam ? deckmem.sk : 1);
  detail_elem.querySelector('#data_centerskill').textContent = toCenterSkillDesc(card);
  detail_elem.querySelector('#data_memberid').textContent = card.i;

  var spinboxs = detail_elem.getElementsByClassName('spin_box');
  for(var i = 0; i < spinboxs.length; i++) {
    var spin_input = spinboxs[i].querySelector('.spin_value');
    var spin_up = spinboxs[i].querySelector('.spinup_button');
    var spin_down = spinboxs[i].querySelector('.spindown_button');
    initSpinBox(spin_input, spin_up, spin_down);
  }

  const btntext = deckmem != null ? '変更する' : '閉じる';
  showDialog(detail_elem, '', 'card_detail_dlg', btntext, 1, update_deckmember, true, true);
}



/* ----------------------------------------------------------------------
*  Card Search
---------------------------------------------------------------------- */

/* viewCardList
====================================================================== */
function viewCardList(listelem, cards, pagenum, skill_level, select_func) {
  listelem.innerHTML = '';
  items_elem = document.createDocumentFragment();

  const pageitem_min = (VIEW_PAGEITEM * (pagenum - 1)) + 1;
  const pageitem_max = Math.min(VIEW_PAGEITEM * pagenum, cards.length);

  for(var i = pageitem_min; i <= pageitem_max; i++) {
    var elem = cards[i - 1];

    var item_elem = document.createElement('div'); item_elem.className = 'card_item';
    item_elem.innerHTML = 
      '<div class="member_icon" data-unitnumber="0">' +
        '<img src="" class="member_img"><img src="" class="member_frame">' +
      '</div>' +
      '<div class="card_data">' +
        '<div class="card_name"></div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">特技</div><div class="detail_desc skill_type"></div>' +
        '</div>' +
        '<div class="card_detail nowrap">' +
          '<div class="detail_name">効果</div><div class="detail_desc skill_desc"></div>' +
        '</div>' +
        '<div class="card_param">' +
          '<div class="param_life"><span class="param_num"></span></div>' +
          '<div class="param_smile"><span class="param_num"></span></div>' +
          '<div class="param_pure"><span class="param_num"></span></div>' +
          '<div class="param_cool"><span class="param_num"></span></div>' +
        '</div>' +
      '</div>';

    var cardrarity = '', cardeponym = '', membername = toMemberName(elem, false);
    switch(elem.r) {
      case RARITY.UR: cardrarity = 'UR'; break;
    }
    if(elem.n != '') cardeponym = '【' + elem.n + '】';

    item_elem.querySelector('.member_icon').dataset.unitnumber = elem.i;
    item_elem.querySelector('.member_img').src = toIconAssetPath(elem, false);
    item_elem.querySelector('.member_frame').src = toIconFrameAssetPath(elem);
    item_elem.querySelector('.card_name').textContent = cardrarity + cardeponym + membername;
    item_elem.querySelector('.skill_type').textContent = toSkillType(elem);
    item_elem.querySelector('.skill_desc').textContent = toSkillDesc(elem, skill_level);
    item_elem.querySelector('.param_life > .param_num').textContent = elem.h;
    item_elem.querySelector('.param_smile > .param_num').textContent = elem.s;
    item_elem.querySelector('.param_pure > .param_num').textContent = elem.p;
    item_elem.querySelector('.param_cool > .param_num').textContent = elem.c;

    item_elem.addEventListener('click', function(e) {
      var unitnum = parseInt(this.querySelector('.member_icon').dataset.unitnumber);
      select_func(unitnum);
    });
    items_elem.appendChild(item_elem);
  }
  listelem.appendChild(items_elem);
}


/* searchCardList
====================================================================== */
function searchCardList(param) {
  const p_rarity = param.hasOwnProperty('rarity');
  const p_attr = param.hasOwnProperty('attribute');
  const p_member = param.hasOwnProperty('member');
  const p_skname = param.hasOwnProperty('skillname');
  const p_skill = param.hasOwnProperty('skill');
  const p_trigger = param.hasOwnProperty('trigger');
  const p_trigmin = param.hasOwnProperty('min_trigger');
  const p_trigmax = param.hasOwnProperty('max_trigger');
  const p_type = param.hasOwnProperty('cardtype');

  if(p_trigmin && p_trigmax) {
    const min_trig = Math.min(param.min_trigger, param.max_trigger);
    const max_trig = Math.min(param.min_trigger, param.max_trigger);
    param.min_trigger = min_trig; param.max_trigger = max_trig;
  }

  var searchresult = cards_data.cards.filter(function(card) {
    if(p_rarity) { if(param.rarity.indexOf(card.r) == -1) return false; }
    if(p_attr) { if(param.attribute.indexOf(card.a) == -1) return false; }
    if(p_member) { if(param.member.indexOf(card.u) == -1) return false; }
    if(p_skname) { if(card.m.indexOf(param.skillname) == -1) return false; }
    if(p_skill) { if(param.skill.indexOf(card.y) == -1) return false; }
    if(p_trigger) { if(param.trigger.indexOf(card.t) == -1) return false; }
    if(p_type) { if(param.cardtype.indexOf(card.z) == -1) return false; }
    if(p_trigmin) { 
      if(card.y == 0) return false;
      if(card.k[MAX_SKILL - 1].t < param.min_trigger) return false;
    }
    if(p_trigmax) { 
      if(card.y == 0) return false;
      if(card.k[MAX_SKILL - 1].t > param.max_trigger) return false;
    }

    return true;
  });

  return searchresult;
}


/* sortCardList
====================================================================== */
function sortCardList(cards, criteria, sortorder) {
  cards.sort(function(a, b) {
    var cardcomp;
    switch(criteria) {
      case SORT_CRITERIA.ID: cardcomp = a.i - b.i; break;
      case SORT_CRITERIA.SMILE: cardcomp = a.s - b.s; break;
      case SORT_CRITERIA.PURE: cardcomp = a.p - b.p; break;
      case SORT_CRITERIA.COOL: cardcomp = a.c - b.c; break;

      case SORT_CRITERIA.TRIGGER:
        if(a.y == 0 && b.y != 0) { cardcomp = -1; break; }
        if(a.y != 0 && b.y == 0) { cardcomp = 1; break; }
        if(a.y == 0 && b.y == 0) { cardcomp = 0; break; }
        if(a.t != b.t) { cardcomp = a.t - b.t; break; }
        cardcomp = a.k[MAX_SKILL - 1].t - b.k[MAX_SKILL - 1].t; break;

      case SORT_CRITERIA.CHANCE:
        if(a.y == 0 && b.y != 0) { cardcomp = -1; break; }
        if(a.y != 0 && b.y == 0) { cardcomp = 1; break; }
        if(a.y == 0 && b.y == 0) { cardcomp = 0; break; }
        cardcomp = a.k[MAX_SKILL - 1].r - b.k[MAX_SKILL - 1].r; break;

      case SORT_CRITERIA.DURATION:
        if(a.y == 0 && b.y != 0) { cardcomp = -1; break; }
        if(a.y != 0 && b.y == 0) { cardcomp = 1; break; }
        if(a.y == 0 && b.y == 0) { cardcomp = 0; break; }
        cardcomp = a.k[MAX_SKILL - 1].s - b.k[MAX_SKILL - 1].s; break;

      case SORT_CRITERIA.VALUE:
        if(a.y == 0 && b.y != 0) { cardcomp = -1; break; }
        if(a.y != 0 && b.y == 0) { cardcomp = 1; break; }
        if(a.y == 0 && b.y == 0) { cardcomp = 0; break; }
        cardcomp = a.k[MAX_SKILL - 1].v - b.k[MAX_SKILL - 1].v; break;

      case SORT_CRITERIA.VALUE_MAX:
        if(a.y == 0 && b.y != 0) { cardcomp = -1; break; }
        if(a.y != 0 && b.y == 0) { cardcomp = 1; break; }
        if(a.y == 0 && b.y == 0) { cardcomp = 0; break; }
        cardcomp = a.k[a.k.length - 1].v - b.k[b.k.length - 1].v; break;

      default: return 0; break;
    }

    if(cardcomp == 0) cardcomp = a.i - b.i;
    return sortorder ? -cardcomp : cardcomp;
  });
}
