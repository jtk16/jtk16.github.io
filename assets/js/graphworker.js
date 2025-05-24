self.importScripts('./graph-laplacian-engine.js');

const engine = new GraphLaplacianEngine();

self.onmessage = function(e) {
  const { eigenvalues, action } = e.data;
  
  let result;
  switch(action) {
    case 'generate':
      result = engine.generateGraphFromEigenvalues(eigenvalues);
      break;
    case 'validate':
      result = engine.validateEigenvalues(eigenvalues);
      break;
    default:
      result = { error: 'Unknown action' };
  }
  
  self.postMessage(result);
};