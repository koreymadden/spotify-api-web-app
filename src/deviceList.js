const DeviceList = props => {
    return (
        <option value={props.id}>
            {props.name}
        </option>
    );
};

export default DeviceList