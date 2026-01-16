from django.test import TestCase

# Create your tests here.
def combinationSum2(arr, target):
        ans = []
        arr.sort()
        def solve(curr, index, target):
            if target == 0:
                ans.append(curr[:])
                return
            for i in range(index, len(arr)):
                if i>index and arr[i]==arr[i-1]:
                    continue
                if arr[i] > target:
                    continue
                curr.append(arr[i])
                solve(curr, i+1, target-arr[i])
                curr.pop()
        solve([], 0, target)
        return ans

print(combinationSum2([1,1,1,2], 2))