const VALID_TRANSITIONS = {
    'Open': ['Investigating'],
    'Investigating': ['Mitigated', 'Open'],
    'Mitigated': ['Resolved', 'Investigating'],
    'Resolved': ['Open']
};

const isValidTransition = (currentStatus, nextStatus) => {
    const allowed = VALID_TRANSITIONS[currentStatus];
    return allowed && allowed.includes(nextStatus);
};