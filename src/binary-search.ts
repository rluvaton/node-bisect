/**
 * Binary search to find the item that starts failing
 *
 * the first item in the array is assumed to be good
 * the last item in the array is assumed to be bad
 *
 * when the array is all good/bad, it returns null
 */
export async function bisect<T>(arr: T[], isSuccess: (val: T) => Promise<boolean>): Promise<T | null> {
  let start = 0;
  let end = arr.length - 1;
  let mid = Math.floor((start + end) / 2);

  let atLeastOneFailed = false;
  let atLeastOneSuccess = false;

  while (start <= end) {
    const item = arr[mid];
    const success = await isSuccess(item);

    if (success) {
      atLeastOneSuccess = true;
      start = mid + 1;
    } else {
      atLeastOneFailed = true;
      end = mid - 1;
    }

    mid = Math.floor((start + end) / 2);
  }

  if (!atLeastOneFailed) {
    return null;
  }

  if (!atLeastOneSuccess) {
    return null;
  }

  // +1 because we want the first failure
  return arr[mid + 1];
}
