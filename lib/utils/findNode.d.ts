import * as ts from "typescript";
/**
 * Find and return a typescript node in a sourcefile.
 */
export declare function findNode<TNode extends ts.Node>(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => node is TNode): TNode | undefined;
