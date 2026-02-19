import heapq
def findKthLargest(nums, k):
        max_heap = []
        ele = len(nums)-2
        for i in range(len(nums)):
            heapq.heappush(max_heap, nums[i])
            if len(max_heap) > k:
                heapq.heappop(max_heap)
        return max_heap[0]
nums = [3,2,1,5,6,4]
k = 2
print(findKthLargest(nums, k))