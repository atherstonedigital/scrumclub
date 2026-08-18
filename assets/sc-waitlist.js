/*
 * sc-waitlist.js — PDP restock waitlist behaviour (blocks/sc-waitlist.liquid)
 *
 * Two jobs:
 *   1. Keep the panel in sync with the selected variant. The panel is
 *      server-rendered per variant, so this listens for the theme's
 *      productSelect event and morphs in the freshly-rendered markup — the
 *      same mechanism product-inventory.js and product-price.js use.
 *   2. Submit without leaving the PDP. Shopify's customer/contact forms
 *      normally full-page POST; here they are posted with fetch and the
 *      panel swaps to its success state in place. Without JS the form still
 *      works as a plain POST (sc-waitlist-messages.liquid renders the result).
 */

import { Component } from '@theme/component';
import { morph } from '@theme/morph';
import { StandardEvents } from '@shopify/events';

/** Shopify appends this to the redirect URL when a storefront form succeeds. */
const POSTED_OK = /(?:customer|contact)_posted=true/;

class ScWaitlist extends Component {
  /** @type {Element | null} */
  #section = null;

  /**
   * Variant ids this shopper has already joined, so the success state survives
   * a morph when they switch size and switch back.
   * @type {Set<string>}
   */
  #joined = new Set();

  connectedCallback() {
    super.connectedCallback();

    this.#section = this.closest('.shopify-section, dialog');
    this.#section?.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
    this.addEventListener('submit', this.#handleSubmit);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#section?.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
    this.removeEventListener('submit', this.#handleSubmit);
  }

  /**
   * Swaps the panel for the newly selected variant's server-rendered markup.
   * @param {Event & { promise?: Promise<{ detail?: any }> }} event
   */
  #handleProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;
    if (!event.promise) return;

    event.promise
      .then(({ detail }) => {
        if (!detail?.html) return;

        const { html, newProduct } = detail;

        if (newProduct) {
          this.dataset.productId = newProduct.id;
        } else if (detail.productId && detail.productId !== this.dataset.productId) {
          return;
        }

        const incoming = html.querySelector('sc-waitlist');
        if (!incoming) return;

        // childrenOnly morphs do not touch the host's attributes, so carry the
        // variant id across ourselves — the joined-state lookup depends on it.
        this.dataset.variantId = incoming.dataset.variantId ?? '';

        morph(this, incoming, { childrenOnly: true });

        if (this.dataset.variantId && this.#joined.has(this.dataset.variantId)) {
          this.#showSuccess();
        }
      })
      .catch((/** @type {any} */ error) => {
        if (error?.name !== 'AbortError') console.warn('[sc-waitlist] Event promise rejected:', error);
      });
  };

  /**
   * @param {Event} event
   */
  #handleSubmit = async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const variantId = this.dataset.variantId;

    this.#clearMessage(form);
    if (button instanceof HTMLButtonElement) button.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'text/html' },
      });

      if (response.ok && POSTED_OK.test(response.url)) {
        if (variantId) this.#joined.add(variantId);
        this.#showSuccess();
        return;
      }

      // Success could not be confirmed — most likely Shopify rejected the
      // address. Hand back to the browser so Shopify renders its own errors
      // rather than us guessing at them.
      form.submit();
    } catch (error) {
      console.warn('[sc-waitlist] Submission failed:', error);
      if (button instanceof HTMLButtonElement) button.disabled = false;
      this.#showMessage(form);
    }
  };

  #showSuccess() {
    const form = this.querySelector('form');
    const done = this.querySelector('[data-sc-waitlist-done]');

    if (form instanceof HTMLElement) form.hidden = true;
    if (done instanceof HTMLElement) done.hidden = false;
  }

  /**
   * @param {HTMLFormElement} form
   */
  #clearMessage(form) {
    form.querySelector('[data-sc-waitlist-msg]')?.remove();
  }

  /**
   * @param {HTMLFormElement} form
   */
  #showMessage(form) {
    this.#clearMessage(form);

    const message = document.createElement('p');
    message.className = 'sc-waitlist__msg sc-waitlist__msg--err';
    message.setAttribute('role', 'alert');
    message.dataset.scWaitlistMsg = '';
    message.textContent = this.dataset.errorMessage || "That didn't send. Check the address and try again.";
    form.append(message);
  }
}

if (!customElements.get('sc-waitlist')) {
  customElements.define('sc-waitlist', ScWaitlist);
}
