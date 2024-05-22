import React from 'react';
import { Box, Button, Link } from '@chakra-ui/react';

function DonateButton() {
    return (
        <Box textAlign="center" my={4}>
            {/* Link to your Buy Me a Coffee page */}
            <Link href="https://buymeacoffee.com/viraatlaldv" isExternal>
                <Button colorScheme="yellow">Buy Me a Coffee</Button>
            </Link>
        </Box>
    );
}

export default DonateButton;
