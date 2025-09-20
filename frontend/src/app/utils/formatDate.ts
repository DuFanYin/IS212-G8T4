
export function formatDate(isoString: string) {
  const date = new Date(isoString);
  const options = { month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);
  console.log(formatted);
  const [month, day, year] = formatted.split(' ');
  return `${month}, ${day} ${year}`;
}