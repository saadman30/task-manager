import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import Input from './Input';

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 300,
  ...props
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedOnChange = React.useMemo(
    () => debounce((value) => {
      onChange(value);
    }, debounceMs),
    [onChange, debounceMs]
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
} 