/* @flow */
/**
 * @fileoverview Date picker component
 */

import React from 'react';
import moment from '@date-io/moment';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { styled } from '@material-ui/styles';
import Input from '@components/Input/Input.jsx';

const CssTextField = styled(KeyboardDatePicker)((props) => {
  return {
    '& .MuiInputAdornment-positionEnd': {
      margin: '18px 8px',
    },
    '& .MuiButtonBase-root': {
      color: props.color,
      padding: '0',
    },
    '& .MuiInputBase-input': {
      visibility: 'hidden',
      width: '0px',
    },
  };
});

const MuiDatePicker = ({
  selectedDate,
  className,
  onChange,
  label,
  format = 'DD/MM/yyyy',
  error,
  helperText,
}: {
  selectedDate: string,
  onChange: (d: string) => void,
  label: string,
  format: string,
  error: Boolean,
  helperText: string,
}) => {
  return (
    <MuiPickersUtilsProvider utils={moment}>
      <KeyboardDatePicker
        className={`${className}`}
        autoOk
        variant="inline"
        label={label}
        format={format}
        value={selectedDate}
        InputAdornmentProps={{ position: 'end' }}
        onChange={onChange}
        TextFieldComponent={(props) => (
          <Input {...props} fullWidth theme="light" required />
        )}
        required
        {...{ error, helperText }}
      />
    </MuiPickersUtilsProvider>
  );
};

const OnlyDatePicker = ({
  selectedDate,
  className,
  classNameV,
  onChange,
  label,
  format = 'DD MMM yyyy',
  color,
  id,
  maxDate,
  minDate,
}: {
  selectedDate: string,
  onChange: (d: string) => void,
  label: string,
  format: string,
  maxDate: string,
  minDate: String,
}) => {
  function subtractMonths(date, months) {
    const dateVal = new Date(date);
    dateVal.setMonth(dateVal.getMonth() - months);
    return dateVal;
  }

  return (
    <MuiPickersUtilsProvider utils={moment}>
      {id ? (
        <CssTextField
          views={[id]}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            className: `dateInput ${classNameV}`,
          }}
          className={className}
          autoOk
          variant="inline"
          label={label}
          format={format}
          value={selectedDate}
          onChange={onChange}
          color={color || '#000000'}
          maxDate={maxDate === undefined ? maxDate : new Date()}
          minDate={minDate && subtractMonths(selectedDate, minDate)}
        />
      ) : (
        <CssTextField
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            className: `dateInput ${classNameV}`,
          }}
          className={className}
          autoOk
          variant="inline"
          label={label}
          format={format}
          value={selectedDate}
          onChange={onChange}
          color={color || '#000000'}
          maxDate={maxDate === undefined ? maxDate : new Date()}
          minDate={minDate && subtractMonths(selectedDate, minDate)}
        />
      )}
    </MuiPickersUtilsProvider>
  );
};

export { MuiDatePicker, OnlyDatePicker };
