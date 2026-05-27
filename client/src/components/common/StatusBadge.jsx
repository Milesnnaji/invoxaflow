import { getStatusClass, getStatusDot } from '../../utils/helpers';

export default function StatusBadge({ status, withDot = true }) {
  return (
    <span className={getStatusClass(status)}>
      {withDot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDot(status)}`} />
      )}
      {status}
    </span>
  );
}
