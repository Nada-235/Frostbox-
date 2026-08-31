export function render() {
  const item = state.editingItem || {
    id: null,
    name: '',
    dateAdded: todayStr(),
    goodUntil: todayStr(),
    photo: null,
    note: '',
    reminderEnabled: false,
    reminderAt: '',
    category: 'other',
    location: 'fridge'
  };

  const isEdit = !!item.id;

  return `
    <div>

      <div class="back-row">
        <button class="back-btn" id="back-btn">
          ${backArrow()}
        </button>

        <h2 style="font-size:19px;">
          ${isEdit ? t('edit_item') : t('add_item')}
        </h2>
      </div>

      <div class="screen">

        <div class="photo-picker" id="photo-picker">
          ${
            item.photo
              ? `<img src="${item.photo}">`
              : `<span class="ic">📷</span><span>${t('add_photo')}</span>`
          }
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          id="photo-input"
          style="display:none;"
        >

        <div class="field">
          <label>${t('label_name')}</label>
          <input
            type="text"
            id="f-name"
            value="${escapeHtml(item.name)}"
            placeholder="${t('name_placeholder_food')}"
          >
        </div>

        <div class="field">
          <label>${t('label_category')}</label>

          <div
            class="chip-row"
            id="cat-chips"
            data-scroll-key="food-cat-picker"
          >
            ${FOOD_CATEGORIES.map(c => `
              <button
                class="cat-chip ${
                  ((item.category || 'other') === c.id)
                    ? 'selected'
                    : ''
                }"
                data-cat="${c.id}"
              >
                ${c.icon} ${catLabel(c)}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="field">
          <label>${t('label_storage')}</label>

          <div class="seg-control" id="loc-seg">

            <button
              class="seg-btn ${
                ((item.location || 'fridge') === 'fridge')
                  ? 'active'
                  : ''
              }"
              data-loc="fridge"
            >
              🧊 ${t('filter_fridge')}
            </button>

            <button
              class="seg-btn ${
                ((item.location || 'fridge') === 'freezer')
                  ? 'active'
                  : ''
              }"
              data-loc="freezer"
            >
              ❄️ ${t('filter_freezer')}
            </button>

          </div>
        </div>

        <div class="field">
          <label>${t('label_date_added')}</label>

          <input
            type="date"
            id="f-added"
            value="${item.dateAdded}"
          >
        </div>

        <div class="field">
          <label>${t('label_good_until')}</label>

          <input
            type="date"
            id="f-until"
            value="${item.goodUntil}"
          >
        </div>

        <div class="toggle-row">
          <div class="lbl">
            ${t('label_remind')}
          </div>

          <button
            class="switch ${item.reminderEnabled ? 'on' : ''}"
            id="rem-toggle"
            type="button"
          ></button>
        </div>

        <div
          class="field"
          id="rem-field"
          style="display:${item.reminderEnabled ? 'block' : 'none'};"
        >
          <label>${t('label_reminder_time')}</label>

          <input
            type="datetime-local"
            id="f-reminder"
            value="${
              item.reminderAt ||
              defaultReminderAt(item.goodUntil)
            }"
          >
        </div>

        <div class="field">
          <label>${t('label_note')}</label>

          <textarea
            id="f-note"
            placeholder="${t('note_placeholder')}"
          >${escapeHtml(item.note)}</textarea>
        </div>

        <!-- SAVE / CANCEL -->

        <div class="btn-row">

          <button
            class="btn btn-ghost"
            id="cancel-btn"
            type="button"
          >
            ${t('btn_cancel')}
          </button>

          <button
            class="btn btn-primary"
            id="save-btn"
            type="button"
          >
            ${
              isEdit
                ? t('btn_save_changes')
                : t('btn_add_to_fridge')
            }
          </button>

        </div>

        <!-- EDIT OPTIONS -->

        ${
          isEdit
            ? `
              <div class="btn-row">

                <button
                  class="btn btn-ghost"
                  id="toshop-btn"
                  type="button"
                >
                  ${t('btn_add_to_shopping')}
                </button>

                <button
                  class="btn btn-danger"
                  id="delete-btn"
                  type="button"
                >
                  ${t('btn_delete')}
                </button>

              </div>
            `
            : ''
        }

      </div>

    </div>
  `;
}
