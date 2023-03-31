import React, { useEffect, useState } from 'react';
import {
    Button,
    EditorToolbarButton,
    FormLabel,
    Option,
    Select,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TextField,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
    id: string;
    key: string;
    value: string;
    operator: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        key: '',
        value: '',
        operator: ''
    };
}

const createOptionsArray = (str:string) => str.split(',').reduce((acc, next:string) => {
    if (next?.length) {
        acc = acc.concat(next.trim())
    }
    return acc;
}, [] as string[]);

/** The Field component is the Repeater App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    const { 
        valueName = 'Value',
        valueOnly = false,
        selectName = 'Options', 
        selectOptions = 'includes, excludes',
        valueOptions = '',
        operatorOptions = '',
        operatorName = 'Operator'
    } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);

    const selectOpts = createOptionsArray(selectOptions);
    const valueOpts = createOptionsArray(valueOptions);
    const operatorOpts = createOptionsArray(operatorOptions);

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    });

    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event 
    */
    const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    const createOnChangeSelectHandler = (item: Item, property: 'key' | 'value' | 'operator') => (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    return (
        <div>
            <Table>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            {!valueOnly ? (
                                <TableCell>
                                    <FormLabel htmlFor={`optionSelect-controlled-${item.id}`}>{selectName}</FormLabel>
                                    <Select
                                        id={`optionSelect-controlled-${item.id}`}
                                        name={`optionSelect-controlled-${item.id}`}
                                        value={item.key}
                                        onChange={createOnChangeSelectHandler(item, 'key')}
                                        >
                                            <Option value="">Please choose one...</Option>
                                            {selectOpts.map((opt: any) => ((
                                                <Option value={opt} key={opt}>{opt}</Option>
                                            )))}
                                    </Select>
                                </TableCell>
                            ) : null}
                            {operatorOpts.length ? (
                                <TableCell>
                                    <FormLabel htmlFor={`operatorSelect-controlled-${item.id}`}>{operatorName}</FormLabel>
                                    <Select
                                        id={`operatorSelect-controlled-${item.id}`}
                                        name={`operatorSelect-controlled-${item.id}`}
                                        value={item.operator}
                                        onChange={createOnChangeSelectHandler(item, 'operator')}
                                        >
                                            <Option value="">Please choose one...</Option>
                                            {operatorOpts.map((opt: any) => ((
                                                <Option value={opt} key={opt}>{opt}</Option>
                                            )))}
                                    </Select>
                                </TableCell>
                            ) : null}
                            {valueOpts.length ? (
                                <TableCell>
                                    <FormLabel htmlFor={`optionSelect-controlled-${item.id}`}>{valueName}</FormLabel>
                                    <Select
                                        id={`valueSelect-controlled-${item.id}`}
                                        name={`valueSelect-controlled-${item.id}`}
                                        value={item.value}
                                        onChange={createOnChangeSelectHandler(item, 'value')}
                                        >
                                            <Option value="">Please choose one...</Option>
                                            {valueOpts.map((opt: any) => ((
                                                <Option value={opt} key={opt}>{opt}</Option>
                                            )))}
                                    </Select>
                                </TableCell>
                            ) : (
                                <TableCell>
                                    <TextField
                                        id="value"
                                        name="value"
                                        labelText={valueName}
                                        value={item.value}
                                        onChange={createOnChangeHandler(item, 'value')}
                                    />
                                </TableCell>
                            )}
                            <TableCell align="right">
                                <EditorToolbarButton
                                    label="delete"
                                    icon="Delete"
                                    onClick={() => deleteItem(item)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button
                buttonType="naked"
                onClick={addNewItem}
                icon="PlusCircle"
                style={{ marginTop: tokens.spacingS }}
            >
                Add Item
            </Button>
        </div>
    );
};

export default Field;
