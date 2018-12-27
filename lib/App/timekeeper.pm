package App::timekeeper;
use Mojo::Base -base;

our $VERSION = '0.01';

1;

=encoding utf8

=head1 NAME

App::timekeeper - Create shareable timer

=head1 SYNOPSIS

  $ ./timekeeper daemon --listen http://*:3000

=head1 DESCRIPTION

L<Timekeeper|https://github.com/jhthorsen/app-timekeeper> is web app for
creating shareable timers.

Simply copy and paste the URL in your browser to a friend or coworker, after
L<setting a timer|https://timer.thorsen.pm>.

The idea came when my friend kept saying "Yeah, right", and I wanted to prove I
could do "something" in the amount of time that I had promised.

See L<https://timer.thorsen.pm> for a live demo.

You can also run this application inside Docker:
L<https://cloud.docker.com/repository/docker/jhthorsen/timekeeper>.

=head1 AUTHOR

Jan Henning Thorsen

=head1 COPYRIGHT AND LICENSE

This program is free software, you can redistribute it and/or modify it under
the terms of the Artistic License version 2.0.

=cut
