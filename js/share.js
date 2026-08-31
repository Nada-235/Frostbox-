import { state } from './state.js';
import { t } from './i18n.js';
import { showToast } from './toast.js';

export async function shareHouseholdCode(){
  const text = t('share_text', state.code);
  if(navigator.share){
    try{ await navigator.share({ title: 'Frostbox', text }); return; }
    catch(e){ /* user cancelled the share sheet — not an error */ }
  }
  try{
    await navigator.clipboard.writeText(state.code);
    showToast(t('toast_code_copied'));
  }catch(e){
    alert(`${t('your_code_label')}: ${state.code}`);
  }
}
