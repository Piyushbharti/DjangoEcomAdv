from typing import Optional

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def solve(root):
            if root is None:
                return 0
            
            left = solve(root.left)
            right = solve(root.right)

            if left == -1 or right == -1:
                return -1
            
            if abs(left - right) > 1:
                return -1
            
            return max(left, right) + 1

        return solve(root) != -1


# ---------------- DRIVER CODE ----------------
if __name__ == "__main__":
    # Example 1: Balanced Tree
    #       1
    #      / \
    #     2   3
    root1 = TreeNode(1)
    root1.left = TreeNode(2)
    root1.right = TreeNode(3)
    root1.left = TreeNode(4)
    root1.right = TreeNode(5)
    root1.left = TreeNode(6)
    root1.right = TreeNode(7)

    sol = Solution()
    print("Is Balanced (Tree 1):", sol.isBalanced(root1))  # True
