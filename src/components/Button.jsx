// variant: '' (primário) | 'zest' | 'sec' | 'del' | 'pending'
export default function Button({ variant = '', className = '', ...p }) {
  return <button type="button" className={`btn ${variant} ${className}`} {...p} />
}
