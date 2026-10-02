import styles from './styles.module.scss'

interface TextInterfaceProps {
  onChange: (changeText: string) => void;
  value: string;
  type: 'txt' | 'url';
}

const TextInterface = ({
  onChange,
  value,
  type,
}: TextInterfaceProps) => {
  return (
    <div>
      {type === 'txt' ? (
        <textarea
          onChange={(e) => onChange(e.target.value)}
          value={value}
          autoFocus
          className={`${styles.textarea} bg-surface`}
          maxLength={type === 'txt' ? 10000 : 2048}
          placeholder="Type or paste anything..."
          name="text"
          id="text"
        />
      ) : (
        <input
          onChange={(e) => onChange(e.target.value)}
          value={value}
          autoFocus
          className={`${styles.input} bg-surface`}
          type="url"
          placeholder="https://"
          name="url"
          id="url"
        />
      )
      }
    </div>
  )
}

export default TextInterface;
