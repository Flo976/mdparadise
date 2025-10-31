import type { MarkdownFile } from "@/types";

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  file?: MarkdownFile; // Reference to original file data for files
}

export function buildFileTree(files: MarkdownFile[]): TreeNode[] {
  const root: Map<string, TreeNode> = new Map();

  // First pass: collect all unique folders
  const folders = new Set<string>();
  files.forEach(file => {
    const parts = file.path.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const folderPath = parts.slice(0, i + 1).join('/');
      folders.add(folderPath);
    }
  });

  // Create folder nodes
  const allNodes = new Map<string, TreeNode>();
  folders.forEach(folderPath => {
    const parts = folderPath.split('/');
    const name = parts[parts.length - 1];
    allNodes.set(folderPath, {
      name,
      path: folderPath,
      type: 'folder',
      children: [],
    });
  });

  // Create file nodes
  files.forEach(file => {
    allNodes.set(file.path, {
      name: file.name,
      path: file.path,
      type: 'file',
      file,
    });
  });

  // Build tree hierarchy
  allNodes.forEach((node, path) => {
    const parts = path.split('/');

    if (parts.length === 1) {
      // Root level
      root.set(path, node);
    } else {
      // Find parent
      const parentPath = parts.slice(0, -1).join('/');
      const parent = allNodes.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  });

  // Convert root map to sorted array
  const result = Array.from(root.values());

  // Sort recursively: folders first, then alphabetically
  function sortNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.sort((a, b) => {
      // Folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Then alphabetically
      return a.name.localeCompare(b.name);
    }).map(node => {
      if (node.children) {
        node.children = sortNodes(node.children);
      }
      return node;
    });
  }

  return sortNodes(result);
}
