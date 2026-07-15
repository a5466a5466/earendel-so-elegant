interface ActiveNavigation {
	root: HTMLElement;
	dispose: () => void;
}

let activeNavigation: ActiveNavigation | undefined;

export const initializeLabNavigation = () => {
	const root = document.querySelector<HTMLElement>('[data-lab-navigation]');
	if (!root) return;
	if (activeNavigation?.root === root && root.dataset.ready === 'true') return;
	activeNavigation?.dispose();

	const openButton = root.querySelector<HTMLButtonElement>('[data-lab-menu-open]');
	const closeButton = root.querySelector<HTMLButtonElement>('[data-lab-menu-close]');
	const dialog = root.querySelector<HTMLDialogElement>('[data-lab-mobile-menu]');
	if (!openButton || !closeButton || !dialog) return;

	const closeMenu = (restoreFocus = true) => {
		if (dialog.open && typeof dialog.close === 'function') dialog.close();
		else dialog.removeAttribute('open');
		openButton.setAttribute('aria-expanded', 'false');
		delete document.body.dataset.navigationOpen;
		if (restoreFocus) openButton.focus();
	};
	const openMenu = () => {
		if (typeof dialog.showModal === 'function') dialog.showModal();
		else dialog.setAttribute('open', '');
		openButton.setAttribute('aria-expanded', 'true');
		document.body.dataset.navigationOpen = 'true';
		closeButton.focus();
	};
	const handleCancel = (event: Event) => {
		event.preventDefault();
		closeMenu();
	};
	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === dialog) closeMenu();
	};
	const handleLinkClick = (event: Event) => {
		if ((event.target as Element).closest('a')) closeMenu(false);
	};
	const handleCloseClick = () => closeMenu();
	const handlePageHide = () => closeMenu(false);

	openButton.addEventListener('click', openMenu);
	closeButton.addEventListener('click', handleCloseClick);
	dialog.addEventListener('cancel', handleCancel);
	dialog.addEventListener('click', handleBackdropClick);
	dialog.addEventListener('click', handleLinkClick);
	window.addEventListener('pagehide', handlePageHide);

	root.dataset.ready = 'true';
	activeNavigation = {
		root,
			dispose: () => {
				openButton.removeEventListener('click', openMenu);
				closeButton.removeEventListener('click', handleCloseClick);
			dialog.removeEventListener('cancel', handleCancel);
			dialog.removeEventListener('click', handleBackdropClick);
			dialog.removeEventListener('click', handleLinkClick);
			window.removeEventListener('pagehide', handlePageHide);
			closeMenu(false);
			delete root.dataset.ready;
		},
	};
};
