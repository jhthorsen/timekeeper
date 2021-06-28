use Mojo::Base -strict;
use Mojo::File qw(path);
use Test::Mojo;
use Test::More;

plan skip_all => 'BUILD=1' unless $ENV{BUILD};

$ENV{MOJO_MODE}          = 'production';
$ENV{MOJO_WEBPACK_BUILD} = 1;

my $t = Test::Mojo->new(path('./timekeeper')->to_abs);

$t->get_ok('/')->status_is(200)->content_like(qr[href="/asset/app-timekeeper\.[0-9a-f]{20}\.css"])
  ->content_like(qr[src="/asset/app-timekeeper\.[0-9a-f]{20}\.js"]);

done_testing;
