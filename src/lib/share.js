import { t } from './i18n.js';
import { showToast } from './toast.js';

export async function shareHouseholdCode(code, lang){
  const text = t(lang, 'share_text', code);
  if(navigator.share){
    try{ await navigator.share({ title: 'Frostbox', text }); return; }
    catch(e){ /* user cancelled the share sheet — not an error */ }
  }
  try{
    await navigator.clipboard.writeText(code);
    showToast(t(lang, 'toast_code_copied'));
  }catch(e){
    alert(`${t(lang, 'your_code_label')}: ${code}`);
  }
}
