/**
 * 格式化时间戳
 * @param timestamp 时间戳(毫秒)
 * @param format 格式化模式 默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formatMap: { [key: string]: number } = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
  };

  let result = format;
  for (const [key, value] of Object.entries(formatMap)) {
    result = result.replace(key, value.toString().padStart(2, '0'));
  }

  return result;
}

/**
 * 获取相对时间描述
 * @param timestamp 时间戳(毫秒)
 * @returns 相对时间描述，如：刚刚、5分钟前、2小时前等
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return formatTimestamp(timestamp, 'YYYY-MM-DD');
  }
}
