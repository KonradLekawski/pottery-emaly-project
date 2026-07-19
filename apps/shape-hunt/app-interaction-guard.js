/* Interaction guard: keeps layered renderers compatible with base card click handling.
   Base renderCard reads button.dataset.act. Some extension layers used data-action.
   This layer normalizes both forms so Good / Bad / Save / More always work. */
(function installInteractionGuard(){
  const q=(selector,root=document)=>root.querySelector(selector);
  const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];

  function normalizeActionButtons(root=document){
    qa('button[data-action]',root).forEach((button)=>{
      if(!button.dataset.act) button.dataset.act=button.dataset.action;
      button.removeAttribute('data-action');
    });
  }

  if(typeof cardHTML==='function' && !window.__shapeHuntCardHTMLGuarded){
    window.__shapeHuntCardHTMLGuarded=true;
    const previousCardHTML=cardHTML;
    cardHTML=function guardedCardHTML(...args){
      return previousCardHTML(...args).replaceAll('data-action=','data-act=');
    };
  }

  if(typeof render==='function' && !window.__shapeHuntInteractionGuarded){
    window.__shapeHuntInteractionGuarded=true;
    const previousRender=render;
    render=function renderWithInteractionGuard(...args){
      previousRender(...args);
      normalizeActionButtons();
    };
  }

  // Fix the initial DOM rendered by earlier layers before this script loaded.
  normalizeActionButtons();

  // Re-render once so future card event listeners are attached to normalized buttons.
  if(typeof render==='function') render();
})();
