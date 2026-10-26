'use client';

import { useEffect } from 'react';

/**
 * Defensive DOM Guardian:
 * Prevents "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 * commonly caused by Google Translate, Edge Translator, or third-party extensions
 * wrapping text nodes in <font> or modifying the DOM outside of React's Virtual DOM.
 */
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export function DomGuardian() {
  useEffect(() => {
    // Explicitly enforce no-translate attributes on document
    document.documentElement.classList.add('notranslate');
    document.documentElement.setAttribute('translate', 'no');
  }, []);

  return null;
}
