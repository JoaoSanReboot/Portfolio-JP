import { DOCUMENT, Injectable, inject } from '@angular/core';

/**
 * Tempos da tela de carregamento (ms):
 * - `minMs`: tempo mínimo na tela, contado desde o início da navegação, para o revólver terminar de
 *   carregar as 6 balas (a última entra em ~1,4s). Se a página demorar mais, ela fica até estar pronta.
 * - `fireMs`: do fim do carregamento até a cortina subir (o cão arma, cai e o revólver dispara).
 * - `removeMs`: garantia para tirar o elemento do DOM, caso o `transitionend` não chegue.
 */
const LOADING = { minMs: 1500, fireMs: 420, removeMs: 1200 } as const;

/**
 * Tela de carregamento: um revólver carregando as balas sobre o papel, enquanto a página prepara.
 *
 * A marcação fica em `src/index.html` (aparece antes do Angular) e o estilo em `loading-screen.css`
 * (incluído pelo angular.json). Aqui só fica a saída: quem monta a página chama `dismiss()` quando
 * estiver pronta, e a promessa resolve no instante em que a cortina começa a subir — o momento de
 * começar a entrada da página.
 */
@Injectable({ providedIn: 'root' })
export class LoadingScreen {
  private readonly document = inject(DOCUMENT);
  private dismissing: Promise<void> | null = null;

  /** Dispara a saída (uma vez só; chamadas repetidas recebem a mesma promessa). */
  dismiss(): Promise<void> {
    this.dismissing ??= this.leave();
    return this.dismissing;
  }

  private leave(): Promise<void> {
    const el = this.document.getElementById('fr-loading');
    if (!el) return Promise.resolve();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // performance.now() conta desde o início da navegação, então inclui o tempo antes do Angular.
    const wait = reduced ? 0 : Math.max(0, LOADING.minMs - performance.now());

    return new Promise((resolve) => {
      setTimeout(() => {
        el.classList.add('is-done'); // cão arma, cai e dispara
        setTimeout(
          () => {
            el.classList.add('is-leaving'); // cortina sobe
            const remove = () => el.remove();
            el.addEventListener('transitionend', remove, { once: true });
            setTimeout(remove, LOADING.removeMs);
            resolve();
          },
          reduced ? 0 : LOADING.fireMs,
        );
      }, wait);
    });
  }
}
